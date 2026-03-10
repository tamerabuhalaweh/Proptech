// ============================================================
// Milestones Service — Payment milestones & installments
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, MilestoneStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  PayMilestoneDto,
  QueryMilestoneDto,
} from './dto';

@Injectable()
export class MilestonesService {
  private readonly logger = new Logger(MilestonesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Create a milestone for a booking
   */
  async create(tenantId: string, dto: CreateMilestoneDto, userId: string) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, tenantId },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${dto.bookingId}" not found`);
    }

    const milestone = await this.prisma.milestone.create({
      data: {
        tenantId,
        bookingId: dto.bookingId,
        name: dto.name,
        description: dto.description || null,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'UPCOMING',
        notes: dto.notes || null,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'milestone',
      entityId: milestone.id,
      action: 'created',
      description: `Milestone "${dto.name}" created — amount: ${dto.amount}`,
      performedBy: userId,
      metadata: { bookingId: dto.bookingId, amount: dto.amount },
    });

    this.logger.log(`Milestone created: ${milestone.id}`);
    return milestone;
  }

  /**
   * List milestones with filters
   */
  async findAll(tenantId: string, query: QueryMilestoneDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MilestoneWhereInput = {
      tenantId,
      ...(query.bookingId && { bookingId: query.bookingId }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.milestone.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'dueDate']: query.sortOrder || 'asc' },
      }),
      this.prisma.milestone.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get milestones for a specific booking
   */
  async findByBooking(tenantId: string, bookingId: string) {
    // Verify booking exists
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${bookingId}" not found`);
    }

    return this.prisma.milestone.findMany({
      where: { tenantId, bookingId },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get a single milestone
   */
  async findOne(tenantId: string, id: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id, tenantId },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID "${id}" not found`);
    }

    return milestone;
  }

  /**
   * Update a milestone
   */
  async update(tenantId: string, id: string, dto: UpdateMilestoneDto, userId: string) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.milestone.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'milestone',
      entityId: id,
      action: 'updated',
      description: `Milestone updated`,
      performedBy: userId,
    });

    return updated;
  }

  /**
   * Mark a milestone as paid
   */
  async pay(tenantId: string, id: string, dto: PayMilestoneDto, userId: string) {
    const milestone = await this.findOne(tenantId, id);

    if (milestone.status === MilestoneStatus.PAID) {
      throw new BadRequestException('Milestone is already paid');
    }
    if (milestone.status === MilestoneStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled milestone');
    }

    const updated = await this.prisma.milestone.update({
      where: { id },
      data: {
        status: MilestoneStatus.PAID,
        paidDate: new Date(),
        paymentMethod: dto.paymentMethod,
        receiptNumber: dto.receiptNumber || null,
        notes: dto.notes || milestone.notes,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'milestone',
      entityId: id,
      action: 'paid',
      description: `Milestone "${milestone.name}" marked as paid — method: ${dto.paymentMethod}`,
      performedBy: userId,
      metadata: {
        amount: milestone.amount,
        paymentMethod: dto.paymentMethod,
        receiptNumber: dto.receiptNumber,
      },
    });

    this.logger.log(`Milestone paid: ${id}`);
    return updated;
  }

  /**
   * Get all overdue milestones for tenant
   */
  async findOverdue(tenantId: string) {
    // First, auto-update overdue status
    await this.prisma.milestone.updateMany({
      where: {
        tenantId,
        dueDate: { lt: new Date() },
        status: { in: [MilestoneStatus.UPCOMING, MilestoneStatus.DUE] },
      },
      data: { status: MilestoneStatus.OVERDUE },
    });

    return this.prisma.milestone.findMany({
      where: {
        tenantId,
        status: MilestoneStatus.OVERDUE,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Delete a milestone
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.milestone.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'milestone',
      entityId: id,
      action: 'deleted',
      description: `Milestone deleted`,
      performedBy: userId,
    });

    this.logger.log(`Milestone deleted: ${id}`);
    return { deleted: true };
  }
}
