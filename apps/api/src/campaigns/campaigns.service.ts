// ============================================================
// Campaigns Service — CRUD, auto-apply pricing
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, CampaignStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Create a new campaign
   */
  async create(tenantId: string, dto: CreateCampaignDto, userId: string) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (dto.discountType === 'percentage' && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description || null,
        discountType: dto.discountType || 'percentage',
        discountValue: dto.discountValue,
        startDate,
        endDate,
        propertyIds: dto.propertyIds || [],
        unitIds: dto.unitIds || [],
        createdBy: userId,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'campaign',
      entityId: campaign.id,
      action: 'created',
      description: `Campaign "${campaign.name}" created — ${campaign.discountType} ${campaign.discountValue}`,
      performedBy: userId,
    });

    this.logger.log(`Campaign created: ${campaign.name} (${campaign.id})`);
    return campaign;
  }

  /**
   * List campaigns with filters
   */
  async findAll(tenantId: string, query: QueryCampaignDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      tenantId,
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get campaign details
   */
  async findOne(tenantId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID "${id}" not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign
   */
  async update(tenantId: string, id: string, dto: UpdateCampaignDto, userId: string) {
    await this.findOne(tenantId, id);

    if (dto.startDate && dto.endDate && new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    if (dto.discountType === 'percentage' && dto.discountValue && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.discountType !== undefined && { discountType: dto.discountType }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.propertyIds !== undefined && { propertyIds: dto.propertyIds }),
        ...(dto.unitIds !== undefined && { unitIds: dto.unitIds }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'campaign',
      entityId: id,
      action: 'updated',
      description: `Campaign "${campaign.name}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Campaign updated: ${campaign.name} (${id})`);
    return campaign;
  }

  /**
   * Delete a campaign
   */
  async remove(tenantId: string, id: string, userId: string) {
    const existing = await this.findOne(tenantId, id);

    await this.prisma.campaign.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'campaign',
      entityId: id,
      action: 'deleted',
      description: `Campaign "${existing.name}" deleted`,
      performedBy: userId,
    });

    this.logger.log(`Campaign deleted: ${existing.name} (${id})`);
    return { message: `Campaign "${existing.name}" has been deleted` };
  }

  /**
   * Get active campaign pricing for a unit
   * Returns applicable discount if campaign is active and unit/property is targeted
   */
  async getActiveCampaignDiscount(tenantId: string, unitId: string, propertyId?: string) {
    const now = new Date();

    const activeCampaigns = await this.prisma.campaign.findMany({
      where: {
        tenantId,
        status: CampaignStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Find campaigns that target this unit or its property
    const applicable = activeCampaigns.filter((campaign) => {
      // Campaign targets specific units
      if (campaign.unitIds.length > 0 && campaign.unitIds.includes(unitId)) {
        return true;
      }
      // Campaign targets properties (unit's property)
      if (propertyId && campaign.propertyIds.length > 0 && campaign.propertyIds.includes(propertyId)) {
        return true;
      }
      // Campaign targets all if no specific IDs
      if (campaign.unitIds.length === 0 && campaign.propertyIds.length === 0) {
        return true;
      }
      return false;
    });

    if (applicable.length === 0) return null;

    // Return the best (highest) discount
    const best = applicable.reduce((a, b) => {
      const aVal = a.discountType === 'percentage' ? a.discountValue : a.discountValue;
      const bVal = b.discountType === 'percentage' ? b.discountValue : b.discountValue;
      return aVal >= bVal ? a : b;
    });

    return {
      campaignId: best.id,
      campaignName: best.name,
      discountType: best.discountType,
      discountValue: best.discountValue,
    };
  }
}
