// ============================================================
// Pricing Service — Pricing matrix, discounts, audit trail
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DiscountStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ApproveDiscountDto } from './dto/approve-discount.dto';
import { UpdatePriceDto } from './dto/update-price.dto';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Calculate effective price for a unit (base + premiums - discounts)
   */
  async calculatePrice(tenantId: string, dto: CalculatePriceDto) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, tenantId },
      include: {
        discounts: {
          where: {
            status: DiscountStatus.APPROVED,
            OR: [
              { validTo: null },
              { validTo: { gte: new Date() } },
            ],
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${dto.unitId}" not found`);
    }

    const basePrice = unit.basePrice;
    const floorPremium = (dto.floorPremium || 0) * unit.floor;
    const viewPremium = dto.viewPremium || 0;
    const featurePremiums = (dto.featurePremiums || []).reduce((sum, p) => sum + p, 0);

    const grossPrice = basePrice + floorPremium + viewPremium + featurePremiums;

    // Apply active discounts
    let totalDiscount = 0;
    for (const discount of unit.discounts) {
      if (discount.type === 'percentage') {
        totalDiscount += grossPrice * (discount.value / 100);
      } else {
        totalDiscount += discount.value;
      }
    }

    const finalPrice = Math.max(0, grossPrice - totalDiscount);

    return {
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      breakdown: {
        basePrice,
        floorPremium,
        viewPremium,
        featurePremiums,
        grossPrice,
        totalDiscount,
        finalPrice,
      },
      activeDiscounts: unit.discounts.length,
    };
  }

  /**
   * Update unit price with audit trail
   */
  async updatePrice(tenantId: string, dto: UpdatePriceDto, userId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, tenantId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${dto.unitId}" not found`);
    }

    // Record price history
    await this.prisma.priceHistory.create({
      data: {
        tenantId,
        unitId: dto.unitId,
        oldPrice: unit.basePrice,
        newPrice: dto.newPrice,
        changedBy: userId,
        reason: dto.reason,
      },
    });

    // Update unit price
    const updated = await this.prisma.unit.update({
      where: { id: dto.unitId },
      data: { basePrice: dto.newPrice },
    });

    await this.activity.log({
      tenantId,
      entityType: 'unit',
      entityId: dto.unitId,
      action: 'price_changed',
      description: `Unit "${unit.unitNumber}" price changed: ${unit.basePrice} → ${dto.newPrice}`,
      performedBy: userId,
      metadata: { oldPrice: unit.basePrice, newPrice: dto.newPrice, reason: dto.reason },
    });

    this.logger.log(`Price updated: Unit ${unit.unitNumber} ${unit.basePrice} → ${dto.newPrice}`);
    return updated;
  }

  /**
   * Get price history for a unit
   */
  async getPriceHistory(tenantId: string, unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${unitId}" not found`);
    }

    return this.prisma.priceHistory.findMany({
      where: { tenantId, unitId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================
  // Discount Management
  // ============================================================

  /**
   * Create a discount request
   */
  async createDiscount(tenantId: string, dto: CreateDiscountDto, userId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, tenantId },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${dto.unitId}" not found`);
    }

    // Validate percentage discounts
    if (dto.type === 'percentage' && dto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const discount = await this.prisma.discount.create({
      data: {
        tenantId,
        unitId: dto.unitId,
        type: dto.type,
        value: dto.value,
        reason: dto.reason,
        requestedBy: userId,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
      include: { unit: { select: { unitNumber: true } } },
    });

    await this.activity.log({
      tenantId,
      entityType: 'discount',
      entityId: discount.id,
      action: 'created',
      description: `Discount request created for unit "${discount.unit.unitNumber}": ${dto.type} ${dto.value}`,
      performedBy: userId,
    });

    this.logger.log(`Discount created: ${discount.id} for unit ${dto.unitId}`);
    return discount;
  }

  /**
   * Approve or reject a discount
   */
  async approveDiscount(tenantId: string, discountId: string, dto: ApproveDiscountDto, userId: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id: discountId, tenantId },
      include: { unit: { select: { unitNumber: true } } },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID "${discountId}" not found`);
    }

    if (discount.status !== DiscountStatus.PENDING) {
      throw new BadRequestException(`Discount is already ${discount.status}`);
    }

    const updated = await this.prisma.discount.update({
      where: { id: discountId },
      data: {
        status: dto.status,
        approvedBy: userId,
        approvedAt: dto.status === DiscountStatus.APPROVED ? new Date() : null,
      },
      include: { unit: { select: { unitNumber: true } } },
    });

    await this.activity.log({
      tenantId,
      entityType: 'discount',
      entityId: discountId,
      action: dto.status === DiscountStatus.APPROVED ? 'approved' : 'rejected',
      description: `Discount for unit "${discount.unit.unitNumber}" ${dto.status.toLowerCase()}`,
      performedBy: userId,
    });

    this.logger.log(`Discount ${dto.status}: ${discountId}`);
    return updated;
  }

  /**
   * List discounts for a tenant (optionally filtered by unit)
   */
  async listDiscounts(tenantId: string, unitId?: string) {
    return this.prisma.discount.findMany({
      where: {
        tenantId,
        ...(unitId && { unitId }),
      },
      include: { unit: { select: { id: true, unitNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
