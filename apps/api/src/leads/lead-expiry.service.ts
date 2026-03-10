// ============================================================
// Lead Auto-Expiry Service — Expire inactive leads
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class LeadExpiryService {
  private readonly logger = new Logger(LeadExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Process lead auto-expiry — inactive leads with no activity for N days
   * Default: 90 days of inactivity
   */
  async processExpiry(tenantId: string, userId: string, inactiveDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    // Find active leads (not WON, LOST, or deleted) with no recent activity
    const inactiveLeads = await this.prisma.lead.findMany({
      where: {
        tenantId,
        deletedAt: null,
        stage: { notIn: [LeadStage.WON, LeadStage.LOST] },
        // No activity since cutoff
        activities: {
          none: {
            createdAt: { gte: cutoffDate },
          },
        },
        // Lead itself hasn't been updated since cutoff
        updatedAt: { lte: cutoffDate },
      },
      select: { id: true, name: true, stage: true },
    });

    let expiredCount = 0;
    for (const lead of inactiveLeads) {
      await this.prisma.$transaction(async (tx) => {
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            stage: LeadStage.LOST,
            lostAt: new Date(),
            lostReason: 'Auto-expired due to inactivity',
          },
        });

        await tx.leadActivity.create({
          data: {
            tenantId,
            leadId: lead.id,
            type: 'STAGE_CHANGE',
            title: `Auto-expired: ${lead.stage} → LOST`,
            description: `Lead auto-expired after ${inactiveDays} days of inactivity`,
            performedBy: userId,
            metadata: {
              fromStage: lead.stage,
              toStage: 'LOST',
              reason: 'auto-expiry',
              inactiveDays,
            },
          },
        });
      });
      expiredCount++;
    }

    if (expiredCount > 0) {
      await this.activity.log({
        tenantId,
        entityType: 'lead',
        entityId: 'system',
        action: 'auto_expiry',
        description: `${expiredCount} lead(s) auto-expired after ${inactiveDays} days of inactivity`,
        performedBy: userId,
        metadata: { inactiveDays, expiredCount },
      });
    }

    this.logger.log(
      `Lead expiry check: ${expiredCount}/${inactiveLeads.length} leads expired for tenant ${tenantId}`,
    );

    return {
      processed: inactiveLeads.length,
      expired: expiredCount,
      inactiveDays,
      message: `${expiredCount} lead(s) auto-expired due to ${inactiveDays} days of inactivity`,
    };
  }
}
