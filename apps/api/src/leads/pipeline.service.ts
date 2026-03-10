// ============================================================
// Pipeline Service — Stage transitions, validation, stats
// ============================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Ordered pipeline stages (excluding LOST, which is reachable from any stage)
 */
const STAGE_ORDER: LeadStage[] = [
  LeadStage.NEW,
  LeadStage.CONTACTED,
  LeadStage.QUALIFIED,
  LeadStage.PROPOSAL,
  LeadStage.NEGOTIATION,
  LeadStage.WON,
];

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate a stage transition — can't skip stages, except LOST (reachable from any)
   */
  validateTransition(fromStage: LeadStage, toStage: LeadStage): void {
    // Same stage — no-op
    if (fromStage === toStage) {
      throw new BadRequestException(`Lead is already in stage ${fromStage}`);
    }

    // LOST is always reachable from any stage
    if (toStage === LeadStage.LOST) {
      return;
    }

    // Can't move from WON or LOST without special handling
    if (fromStage === LeadStage.WON) {
      throw new BadRequestException('Cannot transition from WON stage. Create a new lead instead.');
    }
    if (fromStage === LeadStage.LOST) {
      // Allow reopening — only to NEW
      if (toStage !== LeadStage.NEW) {
        throw new BadRequestException('Lost leads can only be reopened to NEW stage');
      }
      return;
    }

    const fromIndex = STAGE_ORDER.indexOf(fromStage);
    const toIndex = STAGE_ORDER.indexOf(toStage);

    if (fromIndex === -1 || toIndex === -1) {
      throw new BadRequestException(`Invalid stage transition: ${fromStage} → ${toStage}`);
    }

    // Can only move forward by exactly 1 step
    if (toIndex !== fromIndex + 1) {
      const nextStage = STAGE_ORDER[fromIndex + 1];
      throw new BadRequestException(
        `Cannot skip stages. From ${fromStage}, next stage must be ${nextStage}`,
      );
    }
  }

  /**
   * Get pipeline statistics — count per stage, conversion rates, avg time in stage
   */
  async getStats(tenantId: string) {
    // Count per stage
    const stageCounts = await this.prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { id: true },
    });

    const stageMap: Record<string, number> = {};
    for (const sc of stageCounts) {
      stageMap[sc.stage] = sc._count.id;
    }

    const totalLeads = Object.values(stageMap).reduce((s, c) => s + c, 0);
    const wonCount = stageMap[LeadStage.WON] || 0;
    const lostCount = stageMap[LeadStage.LOST] || 0;
    const closedCount = wonCount + lostCount;

    // Conversion rates
    const conversionRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;
    const overallWinRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;

    // Average time in each stage (from stage transition activities)
    const avgTimeInStage: Record<string, number | null> = {};
    for (const stage of STAGE_ORDER) {
      const transitions = await this.prisma.leadActivity.findMany({
        where: {
          tenantId,
          type: 'STAGE_CHANGE',
          metadata: { path: ['fromStage'], equals: stage },
        },
        select: { createdAt: true, metadata: true },
      });

      if (transitions.length === 0) {
        avgTimeInStage[stage] = null;
        continue;
      }

      // We need to find when they entered this stage too
      // Approximate: use lead activities with toStage = stage
      const entries = await this.prisma.leadActivity.findMany({
        where: {
          tenantId,
          type: 'STAGE_CHANGE',
          metadata: { path: ['toStage'], equals: stage },
        },
        select: { leadId: true, createdAt: true },
      });

      const entryMap = new Map<string, Date>();
      for (const e of entries) {
        entryMap.set(e.leadId, e.createdAt);
      }

      let totalHours = 0;
      let count = 0;
      for (const t of transitions) {
        const meta = t.metadata as Record<string, unknown>;
        const leadId = meta.leadId as string;
        const entryDate = entryMap.get(leadId);
        if (entryDate) {
          const hours = (t.createdAt.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
          count++;
        }
      }

      avgTimeInStage[stage] = count > 0 ? Math.round(totalHours / count) : null;
    }

    return {
      stages: Object.values(LeadStage).map((stage) => ({
        stage,
        count: stageMap[stage] || 0,
      })),
      total: totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      overallWinRate: Math.round(overallWinRate * 100) / 100,
      avgTimeInStageHours: avgTimeInStage,
    };
  }
}
