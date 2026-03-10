// ============================================================
// Lead Assignment Service — Rule-based and manual assignment
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentRuleDto, AssignmentStrategy } from './dto';

/**
 * In-memory assignment rules per tenant.
 * In production, these would be persisted to DB.
 * For now, stored in tenant config JSON.
 */
export interface TenantAssignmentConfig {
  strategy: AssignmentStrategy;
  userIds: string[];
  propertyMapping: Record<string, string>;
  sourceMapping: Record<string, string>;
  roundRobinIndex: number;
}

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);
  private readonly configs = new Map<string, TenantAssignmentConfig>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Configure assignment rules for a tenant
   */
  async configureRules(tenantId: string, dto: AssignmentRuleDto): Promise<TenantAssignmentConfig> {
    const config: TenantAssignmentConfig = {
      strategy: dto.strategy,
      userIds: dto.userIds || [],
      propertyMapping: dto.propertyMapping || {},
      sourceMapping: dto.sourceMapping || {},
      roundRobinIndex: 0,
    };

    this.configs.set(tenantId, config);

    // Persist to tenant config
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        config: {
          assignmentRules: JSON.parse(JSON.stringify(config)),
        } as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Assignment rules configured for tenant ${tenantId}: ${dto.strategy}`);
    return config;
  }

  /**
   * Get current assignment rules for a tenant
   */
  async getRules(tenantId: string): Promise<TenantAssignmentConfig | null> {
    // Check in-memory first
    if (this.configs.has(tenantId)) {
      return this.configs.get(tenantId)!;
    }

    // Load from tenant config
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { config: true },
    });

    const config = tenant?.config as Record<string, unknown> | null;
    if (config?.assignmentRules) {
      const rules = config.assignmentRules as TenantAssignmentConfig;
      this.configs.set(tenantId, rules);
      return rules;
    }

    return null;
  }

  /**
   * Auto-assign a lead based on active rules
   * Returns the assigned user ID or null if no rule applies
   */
  async autoAssign(
    tenantId: string,
    leadSource: string,
    propertyId?: string | null,
  ): Promise<string | null> {
    const config = await this.getRules(tenantId);
    if (!config) return null;

    // For round-robin, we need userIds
    if (config.strategy === AssignmentStrategy.ROUND_ROBIN && config.userIds.length === 0) {
      return null;
    }

    let assignedTo: string | null = null;

    switch (config.strategy) {
      case AssignmentStrategy.ROUND_ROBIN: {
        const index = config.roundRobinIndex % config.userIds.length;
        assignedTo = config.userIds[index];
        config.roundRobinIndex = index + 1;
        this.configs.set(tenantId, config);
        break;
      }

      case AssignmentStrategy.BY_PROPERTY: {
        if (propertyId && config.propertyMapping[propertyId]) {
          assignedTo = config.propertyMapping[propertyId];
        }
        break;
      }

      case AssignmentStrategy.BY_SOURCE: {
        if (config.sourceMapping[leadSource]) {
          assignedTo = config.sourceMapping[leadSource];
        }
        break;
      }
    }

    if (assignedTo) {
      this.logger.debug(
        `Auto-assigned lead to ${assignedTo} via ${config.strategy} for tenant ${tenantId}`,
      );
    }

    return assignedTo;
  }
}
