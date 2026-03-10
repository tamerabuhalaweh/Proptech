// ============================================================
// Activity Log Service — Centralized audit logging
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogActivityParams {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an activity event
   */
  async log(params: LogActivityParams) {
    try {
      await this.prisma.activityLog.create({
        data: {
          tenantId: params.tenantId,
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          description: params.description,
          performedBy: params.performedBy,
          metadata: (params.metadata || {}) as any,
        },
      });
    } catch (error) {
      // Don't let activity logging failures break the main flow
      this.logger.error(`Failed to log activity: ${error}`);
    }
  }

  /**
   * Get recent activity for a tenant
   */
  async getRecentActivity(tenantId: string, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
