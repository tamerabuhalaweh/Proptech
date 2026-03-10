// ============================================================
// Leads Service — Full CRUD with scoring, pipeline, assignment
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma, LeadStage, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ScoringService } from './scoring.service';
import { PipelineService } from './pipeline.service';
import { AssignmentService } from './assignment.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  ChangeStageDto,
  AssignLeadDto,
  OverrideScoreDto,
  AssignmentRuleDto,
} from './dto';
import { JwtUser } from '../common/decorators';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
    private readonly scoring: ScoringService,
    private readonly pipeline: PipelineService,
    private readonly assignment: AssignmentService,
  ) {}

  // ============================================================
  // CRUD
  // ============================================================

  /**
   * Create a new lead with auto-scoring and auto-assignment
   */
  async create(tenantId: string, dto: CreateLeadDto, userId: string) {
    // Auto-assign if no assignee specified
    let assignedTo = dto.assignedTo || null;
    if (!assignedTo) {
      assignedTo = await this.assignment.autoAssign(tenantId, dto.source || 'WEBSITE', dto.propertyId);
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        propertyId: dto.propertyId,
        unitPreferences: (dto.unitPreferences || {}) as Prisma.InputJsonValue,
        budget: dto.budget,
        budgetMax: dto.budgetMax,
        notes: dto.notes,
        tags: dto.tags || [],
        assignedTo,
      },
      include: {
        property: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, displayName: true, email: true } },
        _count: { select: { activities: true } },
      },
    });

    // Calculate initial score
    await this.scoring.recalculate(lead.id);

    // Log assignment if auto-assigned
    if (assignedTo) {
      await this.prisma.leadActivity.create({
        data: {
          tenantId,
          leadId: lead.id,
          type: 'ASSIGNMENT',
          title: 'Lead auto-assigned',
          description: `Lead automatically assigned to user ${assignedTo}`,
          performedBy: userId,
          metadata: { assignedTo, method: 'auto' } as Prisma.InputJsonValue,
        },
      });
    }

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: lead.id,
      action: 'created',
      description: `Lead "${lead.name}" created`,
      performedBy: userId,
    });

    this.logger.log(`Lead created: ${lead.name} (${lead.id})`);

    // Re-fetch with updated score
    return this.findOne(tenantId, lead.id);
  }

  /**
   * List leads with pagination, filtering, and sorting.
   * Brokers only see leads assigned to them.
   */
  async findAll(tenantId: string, query: QueryLeadDto, user?: JwtUser) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.stage && { stage: query.stage }),
      ...(query.source && { source: query.source }),
      ...(query.assignedTo && { assignedTo: query.assignedTo }),
      ...(query.propertyId && { propertyId: query.propertyId }),
      ...(query.scoreMin != null && { score: { gte: query.scoreMin } }),
      ...(query.scoreMax != null && {
        score: { ...(query.scoreMin != null ? { gte: query.scoreMin } : {}), lte: query.scoreMax },
      }),
      ...(query.createdFrom && { createdAt: { gte: new Date(query.createdFrom) } }),
      ...(query.createdTo && {
        createdAt: {
          ...(query.createdFrom ? { gte: new Date(query.createdFrom) } : {}),
          lte: new Date(query.createdTo),
        },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
          { phone: { contains: query.search, mode: 'insensitive' as const } },
          { notes: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Broker visibility: only see assigned leads
    if (user?.role === UserRole.BROKER) {
      where.assignedTo = user.sub;
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          property: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, displayName: true, email: true } },
          _count: { select: { activities: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single lead by ID
   */
  async findOne(tenantId: string, id: string, user?: JwtUser) {
    const where: Prisma.LeadWhereInput = { id, tenantId, deletedAt: null };

    // Broker visibility
    if (user?.role === UserRole.BROKER) {
      where.assignedTo = user.sub;
    }

    const lead = await this.prisma.lead.findFirst({
      where,
      include: {
        property: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, displayName: true, email: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { activities: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }

    return lead;
  }

  /**
   * Update a lead — recalculates score
   */
  async update(tenantId: string, id: string, dto: UpdateLeadDto, userId: string) {
    await this.findOne(tenantId, id);

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.propertyId !== undefined && { propertyId: dto.propertyId }),
        ...(dto.unitPreferences !== undefined && { unitPreferences: dto.unitPreferences as Prisma.InputJsonValue }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
        ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.assignedTo !== undefined && { assignedTo: dto.assignedTo }),
      },
      include: {
        property: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, displayName: true, email: true } },
        _count: { select: { activities: true } },
      },
    });

    // Recalculate score
    await this.scoring.recalculate(lead.id);

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: lead.id,
      action: 'updated',
      description: `Lead "${lead.name}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Lead updated: ${lead.name} (${lead.id})`);
    return this.findOne(tenantId, lead.id);
  }

  /**
   * Soft-delete a lead
   */
  async remove(tenantId: string, id: string, userId: string) {
    const existing = await this.findOne(tenantId, id);

    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: id,
      action: 'deleted',
      description: `Lead "${existing.name}" soft-deleted`,
      performedBy: userId,
    });

    this.logger.log(`Lead soft-deleted: ${existing.name} (${id})`);
    return { message: `Lead "${existing.name}" has been deleted` };
  }

  // ============================================================
  // Stage Management (PROP-88)
  // ============================================================

  /**
   * Change lead stage with validation and logging
   */
  async changeStage(tenantId: string, id: string, dto: ChangeStageDto, userId: string) {
    const lead = await this.findOne(tenantId, id);

    // Validate transition
    this.pipeline.validateTransition(lead.stage, dto.stage);

    const updateData: Prisma.LeadUpdateInput = {
      stage: dto.stage,
    };

    if (dto.stage === LeadStage.WON) {
      updateData.wonAt = new Date();
    }

    if (dto.stage === LeadStage.LOST) {
      updateData.lostAt = new Date();
      updateData.lostReason = dto.lostReason;
    }

    // If reopening from LOST
    if (lead.stage === LeadStage.LOST && dto.stage === LeadStage.NEW) {
      updateData.lostAt = null;
      updateData.lostReason = null;
    }

    await this.prisma.lead.update({
      where: { id },
      data: updateData,
    });

    // Log stage change activity
    await this.prisma.leadActivity.create({
      data: {
        tenantId,
        leadId: id,
        type: 'STAGE_CHANGE',
        title: `Stage changed: ${lead.stage} → ${dto.stage}`,
        description: dto.notes || null,
        performedBy: userId,
        metadata: {
          fromStage: lead.stage,
          toStage: dto.stage,
          leadId: id,
          ...(dto.lostReason ? { lostReason: dto.lostReason } : {}),
        } as Prisma.InputJsonValue,
      },
    });

    // Recalculate score
    await this.scoring.recalculate(id);

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: id,
      action: 'stage_changed',
      description: `Lead "${lead.name}" stage: ${lead.stage} → ${dto.stage}`,
      performedBy: userId,
      metadata: { fromStage: lead.stage, toStage: dto.stage },
    });

    this.logger.log(`Lead ${id} stage changed: ${lead.stage} → ${dto.stage}`);
    return this.findOne(tenantId, id);
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(tenantId: string) {
    return this.pipeline.getStats(tenantId);
  }

  // ============================================================
  // Scoring (PROP-87)
  // ============================================================

  /**
   * Get score breakdown for a lead
   */
  async getScoreBreakdown(tenantId: string, leadId: string) {
    await this.findOne(tenantId, leadId);
    return this.scoring.getBreakdown(tenantId, leadId);
  }

  /**
   * Override lead score manually
   */
  async overrideScore(tenantId: string, id: string, dto: OverrideScoreDto, userId: string) {
    const lead = await this.findOne(tenantId, id);

    await this.prisma.lead.update({
      where: { id },
      data: { score: dto.score },
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: id,
      action: 'score_override',
      description: `Lead "${lead.name}" score manually set to ${dto.score}`,
      performedBy: userId,
      metadata: { oldScore: lead.score, newScore: dto.score, reason: dto.reason },
    });

    this.logger.log(`Lead ${id} score overridden: ${lead.score} → ${dto.score}`);
    return this.findOne(tenantId, id);
  }

  // ============================================================
  // Assignment (PROP-89)
  // ============================================================

  /**
   * Manually assign a lead
   */
  async assignLead(tenantId: string, id: string, dto: AssignLeadDto, userId: string) {
    const lead = await this.findOne(tenantId, id);
    const previousAssignee = lead.assignedTo;

    await this.prisma.lead.update({
      where: { id },
      data: { assignedTo: dto.assignedTo },
    });

    // Log assignment activity
    await this.prisma.leadActivity.create({
      data: {
        tenantId,
        leadId: id,
        type: 'ASSIGNMENT',
        title: 'Lead manually assigned',
        description: dto.reason || null,
        performedBy: userId,
        metadata: {
          previousAssignee,
          newAssignee: dto.assignedTo,
          method: 'manual',
        } as Prisma.InputJsonValue,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: id,
      action: 'assigned',
      description: `Lead "${lead.name}" assigned to ${dto.assignedTo}`,
      performedBy: userId,
      metadata: { previousAssignee, newAssignee: dto.assignedTo },
    });

    this.logger.log(`Lead ${id} assigned: ${previousAssignee} → ${dto.assignedTo}`);
    return this.findOne(tenantId, id);
  }

  /**
   * Configure assignment rules
   */
  async configureAssignmentRules(tenantId: string, dto: AssignmentRuleDto) {
    return this.assignment.configureRules(tenantId, dto);
  }

  /**
   * Get assignment rules
   */
  async getAssignmentRules(tenantId: string) {
    return this.assignment.getRules(tenantId);
  }
}
