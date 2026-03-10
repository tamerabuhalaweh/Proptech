// ============================================================
// Lead Scoring Service — Auto-calculate score (0-100)
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { Lead, LeadSource, LeadStage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ScoreFactor {
  factor: string;
  points: number;
  reason: string;
}

export interface ScoreBreakdown {
  leadId: string;
  totalScore: number;
  factors: ScoreFactor[];
}

const SOURCE_WEIGHTS: Record<LeadSource, number> = {
  REFERRAL: 20,
  WALK_IN: 15,
  PHONE: 12,
  WEBSITE: 10,
  WHATSAPP: 8,
  SOCIAL: 5,
  EMAIL: 5,
};

const STAGE_WEIGHTS: Partial<Record<LeadStage, number>> = {
  CONTACTED: 5,
  QUALIFIED: 15,
  PROPOSAL: 25,
  NEGOTIATION: 30,
};

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate score breakdown for a lead
   */
  calculateBreakdown(lead: Lead & { lastContactedAt?: Date | null }): ScoreBreakdown {
    const factors: ScoreFactor[] = [];

    // Budget factor
    if (lead.budget != null) {
      factors.push({ factor: 'budget', points: 15, reason: 'Has budget specified' });
    }

    // Email factor
    if (lead.email) {
      factors.push({ factor: 'email', points: 10, reason: 'Has email address' });
    }

    // Phone factor
    if (lead.phone) {
      factors.push({ factor: 'phone', points: 10, reason: 'Has phone number' });
    }

    // Source weight
    const sourcePoints = SOURCE_WEIGHTS[lead.source] || 0;
    if (sourcePoints > 0) {
      factors.push({
        factor: 'source',
        points: sourcePoints,
        reason: `Source: ${lead.source} (weight=${sourcePoints})`,
      });
    }

    // Stage progression
    const stagePoints = STAGE_WEIGHTS[lead.stage] || 0;
    if (stagePoints > 0) {
      factors.push({
        factor: 'stage',
        points: stagePoints,
        reason: `Stage: ${lead.stage} (progression bonus)`,
      });
    }

    // Recent activity — based on lastContactedAt
    if (lead.lastContactedAt) {
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(lead.lastContactedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceContact <= 7) {
        factors.push({ factor: 'recent_activity', points: 10, reason: 'Contacted in last 7 days' });
      } else if (daysSinceContact <= 30) {
        factors.push({ factor: 'recent_activity', points: 5, reason: 'Contacted in last 30 days' });
      }
    }

    // Property interest
    if (lead.propertyId) {
      factors.push({ factor: 'property_interest', points: 10, reason: 'Has property interest specified' });
    }

    const rawScore = factors.reduce((sum, f) => sum + f.points, 0);
    const totalScore = Math.min(100, rawScore);

    return { leadId: lead.id, totalScore, factors };
  }

  /**
   * Calculate and persist score for a lead
   */
  async recalculate(leadId: string): Promise<number> {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return 0;

    const { totalScore } = this.calculateBreakdown(lead);

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score: totalScore },
    });

    this.logger.debug(`Lead ${leadId} score recalculated: ${totalScore}`);
    return totalScore;
  }

  /**
   * Get full score breakdown for a lead
   */
  async getBreakdown(tenantId: string, leadId: string): Promise<ScoreBreakdown> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null },
    });

    if (!lead) {
      return { leadId, totalScore: 0, factors: [] };
    }

    return this.calculateBreakdown(lead);
  }
}
