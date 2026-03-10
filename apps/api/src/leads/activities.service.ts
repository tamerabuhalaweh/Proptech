// ============================================================
// Lead Activities Service — CRUD for follow-up activities
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ScoringService } from './scoring.service';
import {
  CreateLeadActivityDto,
  UpdateLeadActivityDto,
  CompleteActivityDto,
  QueryActivityDto,
} from './dto';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
    private readonly scoring: ScoringService,
  ) {}

  /**
   * Create an activity for a lead
   */
  async create(tenantId: string, leadId: string, dto: CreateLeadActivityDto, userId: string) {
    // Verify lead exists
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID "${leadId}" not found`);
    }

    const leadActivity = await this.prisma.leadActivity.create({
      data: {
        tenantId,
        leadId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        performedBy: userId,
        metadata: (dto.metadata || {}) as Prisma.InputJsonValue,
      },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    // Update lastContactedAt on lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() },
    });

    // Recalculate score (activity might affect it)
    await this.scoring.recalculate(leadId);

    await this.activity.log({
      tenantId,
      entityType: 'lead_activity',
      entityId: leadActivity.id,
      action: 'created',
      description: `Activity "${leadActivity.title}" created for lead "${lead.name}"`,
      performedBy: userId,
    });

    this.logger.log(`Activity created: ${leadActivity.title} for lead ${leadId}`);
    return leadActivity;
  }

  /**
   * Update an activity
   */
  async update(tenantId: string, activityId: string, dto: UpdateLeadActivityDto, userId: string) {
    await this.findOneActivity(tenantId, activityId);

    const updated = await this.prisma.leadActivity.update({
      where: { id: activityId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as Prisma.InputJsonValue }),
      },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead_activity',
      entityId: activityId,
      action: 'updated',
      description: `Activity "${updated.title}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Activity updated: ${updated.title} (${activityId})`);
    return updated;
  }

  /**
   * Complete an activity with outcome
   */
  async complete(tenantId: string, activityId: string, dto: CompleteActivityDto, userId: string) {
    const existing = await this.findOneActivity(tenantId, activityId);

    const updated = await this.prisma.leadActivity.update({
      where: { id: activityId },
      data: {
        completedAt: new Date(),
        outcome: dto.outcome,
        ...(dto.notes && { description: `${existing.description || ''}\n\nCompletion notes: ${dto.notes}`.trim() }),
      },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    // Update lastContactedAt on lead
    await this.prisma.lead.update({
      where: { id: existing.leadId },
      data: { lastContactedAt: new Date() },
    });

    // Recalculate score
    await this.scoring.recalculate(existing.leadId);

    await this.activity.log({
      tenantId,
      entityType: 'lead_activity',
      entityId: activityId,
      action: 'completed',
      description: `Activity "${updated.title}" completed with outcome: ${dto.outcome}`,
      performedBy: userId,
    });

    this.logger.log(`Activity completed: ${updated.title} (${activityId})`);
    return updated;
  }

  /**
   * Delete an activity
   */
  async remove(tenantId: string, activityId: string, userId: string) {
    const existing = await this.findOneActivity(tenantId, activityId);

    await this.prisma.leadActivity.delete({
      where: { id: activityId },
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead_activity',
      entityId: activityId,
      action: 'deleted',
      description: `Activity "${existing.title}" deleted`,
      performedBy: userId,
    });

    this.logger.log(`Activity deleted: ${existing.title} (${activityId})`);
    return { message: `Activity "${existing.title}" has been deleted` };
  }

  /**
   * List activities for a specific lead
   */
  async findByLead(tenantId: string, leadId: string, query: QueryActivityDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadActivityWhereInput = {
      tenantId,
      leadId,
      ...(query.type && { type: query.type }),
      ...(query.scheduledFrom && { scheduledAt: { gte: new Date(query.scheduledFrom) } }),
      ...(query.scheduledTo && {
        scheduledAt: {
          ...(query.scheduledFrom ? { gte: new Date(query.scheduledFrom) } : {}),
          lte: new Date(query.scheduledTo),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.leadActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          lead: { select: { id: true, name: true } },
        },
      }),
      this.prisma.leadActivity.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get upcoming activities for the current user
   */
  async getUpcoming(tenantId: string, userId: string, limit = 20) {
    return this.prisma.leadActivity.findMany({
      where: {
        tenantId,
        performedBy: userId,
        scheduledAt: { gte: new Date() },
        completedAt: null,
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        lead: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  /**
   * Get overdue activities (scheduled in past, not completed)
   */
  async getOverdue(tenantId: string, userId: string, limit = 20) {
    return this.prisma.leadActivity.findMany({
      where: {
        tenantId,
        performedBy: userId,
        scheduledAt: { lt: new Date() },
        completedAt: null,
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        lead: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private async findOneActivity(tenantId: string, activityId: string) {
    const activity = await this.prisma.leadActivity.findFirst({
      where: { id: activityId, tenantId },
      include: {
        lead: { select: { id: true, name: true } },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID "${activityId}" not found`);
    }

    return activity;
  }
}
