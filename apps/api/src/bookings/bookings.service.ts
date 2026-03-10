// ============================================================
// Bookings Service — Booking flow, status transitions, expiry
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, BookingStatus, UnitStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateBookingDto, QueryBookingDto, CancelBookingDto, CheckExpiryDto } from './dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Check if unit already has an active booking (PENDING or CONFIRMED)
   * SECURITY: Scoped to tenant to prevent cross-tenant information leakage
   */
  private async assertNoActiveBooking(tenantId: string, unitId: string): Promise<void> {
    const existing = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        unitId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Unit already has an active booking with status ${existing.status}`,
      );
    }
  }

  /**
   * Create a booking — validates unit is AVAILABLE, sets unit to RESERVED
   */
  async create(tenantId: string, dto: CreateBookingDto, userId: string) {
    // Verify unit exists, belongs to tenant, and is AVAILABLE
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, tenantId },
    });
    if (!unit) {
      throw new NotFoundException(`Unit with ID "${dto.unitId}" not found`);
    }
    if (unit.status !== UnitStatus.AVAILABLE) {
      throw new BadRequestException(
        `Unit is not available for booking. Current status: ${unit.status}`,
      );
    }

    // Verify no active booking on this unit
    await this.assertNoActiveBooking(tenantId, dto.unitId);

    // Verify lead if provided
    if (dto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: dto.leadId, tenantId, deletedAt: null },
      });
      if (!lead) {
        throw new NotFoundException(`Lead with ID "${dto.leadId}" not found`);
      }
    }

    // Create booking and update unit status atomically
    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          tenantId,
          unitId: dto.unitId,
          leadId: dto.leadId || null,
          totalPrice: dto.totalPrice,
          downPayment: dto.downPayment || 0,
          paymentPlan: (dto.paymentPlan || {}) as Prisma.InputJsonValue,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          documents: dto.documents || [],
          notes: dto.notes || null,
          createdBy: userId,
        },
        include: {
          unit: { select: { id: true, unitNumber: true, buildingId: true } },
          lead: { select: { id: true, name: true } },
        },
      });

      // Set unit to RESERVED
      await tx.unit.update({
        where: { id: dto.unitId },
        data: { status: UnitStatus.RESERVED },
      });

      return created;
    });

    await this.activity.log({
      tenantId,
      entityType: 'booking',
      entityId: booking.id,
      action: 'created',
      description: `Booking created for unit "${booking.unit.unitNumber}" — total: ${booking.totalPrice}`,
      performedBy: userId,
      metadata: { unitId: dto.unitId, leadId: dto.leadId, totalPrice: dto.totalPrice },
    });

    this.logger.log(`Booking created: ${booking.id} for unit ${dto.unitId}`);
    return booking;
  }

  /**
   * List bookings with filters
   */
  async findAll(tenantId: string, query: QueryBookingDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
      ...(query.unitId && { unitId: query.unitId }),
      ...(query.leadId && { leadId: query.leadId }),
      ...(query.propertyId && {
        unit: { building: { propertyId: query.propertyId } },
      }),
      ...(query.dateFrom || query.dateTo
        ? {
            reservationDate: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          unit: {
            select: {
              id: true,
              unitNumber: true,
              building: { select: { id: true, name: true, propertyId: true } },
            },
          },
          lead: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get booking details
   */
  async findOne(tenantId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            floor: true,
            type: true,
            area: true,
            basePrice: true,
            building: {
              select: { id: true, name: true, property: { select: { id: true, name: true } } },
            },
          },
        },
        lead: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    return booking;
  }

  /**
   * Confirm a booking — sets unit to SOLD
   */
  async confirm(tenantId: string, id: string, userId: string) {
    const booking = await this.findOne(tenantId, id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot confirm booking with status "${booking.status}". Only PENDING bookings can be confirmed.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const confirmed = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: {
          unit: { select: { id: true, unitNumber: true } },
          lead: { select: { id: true, name: true } },
        },
      });

      // Set unit to SOLD
      await tx.unit.update({
        where: { id: booking.unitId },
        data: { status: UnitStatus.SOLD },
      });

      return confirmed;
    });

    await this.activity.log({
      tenantId,
      entityType: 'booking',
      entityId: id,
      action: 'confirmed',
      description: `Booking confirmed for unit "${updated.unit.unitNumber}"`,
      performedBy: userId,
    });

    this.logger.log(`Booking confirmed: ${id}`);
    return updated;
  }

  /**
   * Cancel a booking — sets unit back to AVAILABLE
   */
  async cancel(tenantId: string, id: string, dto: CancelBookingDto, userId: string) {
    const booking = await this.findOne(tenantId, id);

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED) {
      throw new BadRequestException(
        `Cannot cancel booking with status "${booking.status}".`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const cancelled = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
        include: {
          unit: { select: { id: true, unitNumber: true } },
          lead: { select: { id: true, name: true } },
        },
      });

      // Release unit
      await tx.unit.update({
        where: { id: booking.unitId },
        data: { status: UnitStatus.AVAILABLE },
      });

      return cancelled;
    });

    await this.activity.log({
      tenantId,
      entityType: 'booking',
      entityId: id,
      action: 'cancelled',
      description: `Booking cancelled for unit "${updated.unit.unitNumber}" — reason: ${dto.reason}`,
      performedBy: userId,
      metadata: { reason: dto.reason },
    });

    this.logger.log(`Booking cancelled: ${id}`);
    return updated;
  }

  /**
   * Mark booking as completed
   */
  async complete(tenantId: string, id: string, userId: string) {
    const booking = await this.findOne(tenantId, id);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot complete booking with status "${booking.status}". Only CONFIRMED bookings can be completed.`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        unit: { select: { id: true, unitNumber: true } },
        lead: { select: { id: true, name: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'booking',
      entityId: id,
      action: 'completed',
      description: `Booking completed for unit "${updated.unit.unitNumber}"`,
      performedBy: userId,
    });

    this.logger.log(`Booking completed: ${id}`);
    return updated;
  }

  /**
   * Process expired bookings — pending bookings past expiry or older than X days
   */
  async checkExpiry(tenantId: string, dto: CheckExpiryDto, userId: string) {
    const expiryDays = dto.expiryDays || 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - expiryDays);

    // Find pending bookings that are expired
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        status: BookingStatus.PENDING,
        OR: [
          { expiryDate: { lte: new Date() } },
          { expiryDate: null, createdAt: { lte: cutoffDate } },
        ],
      },
      include: {
        unit: { select: { id: true, unitNumber: true } },
      },
    });

    let expiredCount = 0;
    for (const booking of expiredBookings) {
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.EXPIRED,
            cancelReason: `Auto-expired after ${expiryDays} days`,
          },
        });

        // Release unit
        await tx.unit.update({
          where: { id: booking.unitId },
          data: { status: UnitStatus.AVAILABLE },
        });
      });
      expiredCount++;
    }

    if (expiredCount > 0) {
      await this.activity.log({
        tenantId,
        entityType: 'booking',
        entityId: 'system',
        action: 'expiry_check',
        description: `${expiredCount} booking(s) expired and units released`,
        performedBy: userId,
        metadata: { expiryDays, expiredCount },
      });
    }

    this.logger.log(`Expiry check: ${expiredCount} bookings expired for tenant ${tenantId}`);
    return {
      processed: expiredBookings.length,
      expired: expiredCount,
      message: `${expiredCount} booking(s) expired and units released`,
    };
  }
}
