// ============================================================
// Lead Duplicate Detection Service — Phone normalization, fuzzy matching
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CheckDuplicatesDto } from './dto/check-duplicates.dto';

export interface DuplicateMatch {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  confidence: number;
  matchReasons: string[];
}

@Injectable()
export class DuplicateDetectionService {
  private readonly logger = new Logger(DuplicateDetectionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Normalize phone number:
   * - Strip spaces, dashes, parentheses
   * - Handle +966 prefix
   * - Remove leading zeros after country code
   */
  normalizePhone(phone: string): string {
    // Strip non-numeric chars except leading +
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Handle Saudi +966 prefix variations
    if (normalized.startsWith('+966')) {
      normalized = '+966' + normalized.slice(4).replace(/^0+/, '');
    } else if (normalized.startsWith('00966')) {
      normalized = '+966' + normalized.slice(5).replace(/^0+/, '');
    } else if (normalized.startsWith('966')) {
      normalized = '+966' + normalized.slice(3).replace(/^0+/, '');
    } else if (normalized.startsWith('05')) {
      normalized = '+966' + normalized.slice(1);
    } else if (normalized.startsWith('5') && normalized.length === 9) {
      normalized = '+966' + normalized;
    }

    return normalized;
  }

  /**
   * Simple fuzzy name similarity (Dice coefficient on bigrams)
   */
  private nameSimilarity(a: string, b: string): number {
    const aNorm = a.toLowerCase().trim();
    const bNorm = b.toLowerCase().trim();

    if (aNorm === bNorm) return 100;

    const getBigrams = (s: string): Set<string> => {
      const bigrams = new Set<string>();
      for (let i = 0; i < s.length - 1; i++) {
        bigrams.add(s.substring(i, i + 2));
      }
      return bigrams;
    };

    const aBigrams = getBigrams(aNorm);
    const bBigrams = getBigrams(bNorm);

    let intersection = 0;
    for (const bigram of aBigrams) {
      if (bBigrams.has(bigram)) intersection++;
    }

    if (aBigrams.size + bBigrams.size === 0) return 0;
    return Math.round((2 * intersection) / (aBigrams.size + bBigrams.size) * 100);
  }

  /**
   * Check for potential duplicates before lead creation
   */
  async checkDuplicates(tenantId: string, dto: CheckDuplicatesDto): Promise<DuplicateMatch[]> {
    const matches: Map<string, DuplicateMatch> = new Map();

    // 1. Exact email match (confidence: 95)
    if (dto.email) {
      const emailMatches = await this.prisma.lead.findMany({
        where: {
          tenantId,
          deletedAt: null,
          email: { equals: dto.email, mode: 'insensitive' },
        },
        select: { id: true, name: true, email: true, phone: true },
      });
      for (const lead of emailMatches) {
        matches.set(lead.id, {
          ...lead,
          confidence: 95,
          matchReasons: ['Exact email match'],
        });
      }
    }

    // 2. Normalized phone match (confidence: 90)
    if (dto.phone) {
      const normalizedInput = this.normalizePhone(dto.phone);

      // Get all leads with phone numbers for this tenant
      const leadsWithPhone = await this.prisma.lead.findMany({
        where: { tenantId, deletedAt: null, phone: { not: null } },
        select: { id: true, name: true, email: true, phone: true },
      });

      for (const lead of leadsWithPhone) {
        if (!lead.phone) continue;
        const normalizedLead = this.normalizePhone(lead.phone);
        if (normalizedLead === normalizedInput) {
          const existing = matches.get(lead.id);
          if (existing) {
            existing.confidence = Math.min(99, existing.confidence + 5);
            existing.matchReasons.push('Normalized phone match');
          } else {
            matches.set(lead.id, {
              ...lead,
              confidence: 90,
              matchReasons: ['Normalized phone match'],
            });
          }
        }
      }
    }

    // 3. Fuzzy name + phone match (confidence based on similarity)
    if (dto.phone) {
      const normalizedInput = this.normalizePhone(dto.phone);
      const leadsWithPhone = await this.prisma.lead.findMany({
        where: { tenantId, deletedAt: null, phone: { not: null } },
        select: { id: true, name: true, email: true, phone: true },
      });

      for (const lead of leadsWithPhone) {
        if (!lead.phone || matches.has(lead.id)) continue;
        const normalizedLead = this.normalizePhone(lead.phone);

        // Check if phones are similar (last 7 digits match)
        const lastDigitsInput = normalizedInput.replace(/\D/g, '').slice(-7);
        const lastDigitsLead = normalizedLead.replace(/\D/g, '').slice(-7);

        if (lastDigitsInput === lastDigitsLead) {
          const nameSim = this.nameSimilarity(dto.name, lead.name);
          if (nameSim >= 60) {
            matches.set(lead.id, {
              ...lead,
              confidence: Math.min(85, Math.round(nameSim * 0.85)),
              matchReasons: [`Fuzzy name match (${nameSim}%) + similar phone`],
            });
          }
        }
      }
    }

    // 4. Fuzzy name match alone (lower confidence)
    const nameMatches = await this.prisma.lead.findMany({
      where: {
        tenantId,
        deletedAt: null,
        name: { contains: dto.name.split(' ')[0], mode: 'insensitive' },
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 20,
    });

    for (const lead of nameMatches) {
      if (matches.has(lead.id)) continue;
      const similarity = this.nameSimilarity(dto.name, lead.name);
      if (similarity >= 75) {
        matches.set(lead.id, {
          ...lead,
          confidence: Math.min(70, Math.round(similarity * 0.7)),
          matchReasons: [`Fuzzy name match (${similarity}%)`],
        });
      }
    }

    // Sort by confidence descending
    return Array.from(matches.values()).sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Merge two leads — combine activities, keep target, soft-delete source
   */
  async mergeLeads(
    tenantId: string,
    targetId: string,
    sourceId: string,
    userId: string,
  ) {
    // Verify both leads exist
    const [target, source] = await Promise.all([
      this.prisma.lead.findFirst({ where: { id: targetId, tenantId, deletedAt: null } }),
      this.prisma.lead.findFirst({ where: { id: sourceId, tenantId, deletedAt: null } }),
    ]);

    if (!target) {
      throw new NotFoundException(`Target lead "${targetId}" not found`);
    }
    if (!source) {
      throw new NotFoundException(`Source lead "${sourceId}" not found`);
    }
    if (targetId === sourceId) {
      throw new BadRequestException('Cannot merge a lead with itself');
    }

    await this.prisma.$transaction(async (tx) => {
      // Move all activities from source to target
      await tx.leadActivity.updateMany({
        where: { leadId: sourceId },
        data: { leadId: targetId },
      });

      // Move bookings from source to target
      await tx.booking.updateMany({
        where: { leadId: sourceId },
        data: { leadId: targetId },
      });

      // Merge tags (union)
      const mergedTags = Array.from(new Set([...(target.tags || []), ...(source.tags || [])]));

      // Update target with merged data
      const updates: Prisma.LeadUpdateInput = {
        tags: mergedTags,
      };

      // Fill in missing data from source
      if (!target.email && source.email) updates.email = source.email;
      if (!target.phone && source.phone) updates.phone = source.phone;
      if (!target.budget && source.budget) updates.budget = source.budget;
      if (!target.budgetMax && source.budgetMax) updates.budgetMax = source.budgetMax;
      if (!target.propertyId && source.propertyId) {
        updates.property = { connect: { id: source.propertyId } };
      }
      if (!target.notes && source.notes) {
        updates.notes = source.notes;
      } else if (target.notes && source.notes) {
        updates.notes = `${target.notes}\n--- Merged from ${source.name} ---\n${source.notes}`;
      }

      await tx.lead.update({ where: { id: targetId }, data: updates });

      // Soft-delete source lead
      await tx.lead.update({
        where: { id: sourceId },
        data: {
          deletedAt: new Date(),
          notes: `Merged into lead ${targetId} by ${userId}`,
        },
      });

      // Log merge activity on target
      await tx.leadActivity.create({
        data: {
          tenantId,
          leadId: targetId,
          type: 'NOTE',
          title: 'Lead merged',
          description: `Lead "${source.name}" (${sourceId}) merged into this lead`,
          performedBy: userId,
          metadata: { sourceId, sourceName: source.name } as Prisma.InputJsonValue,
        },
      });
    });

    await this.activity.log({
      tenantId,
      entityType: 'lead',
      entityId: targetId,
      action: 'merged',
      description: `Lead "${source.name}" merged into "${target.name}"`,
      performedBy: userId,
      metadata: { sourceId, targetId },
    });

    this.logger.log(`Leads merged: ${sourceId} → ${targetId}`);

    // Return updated target
    return this.prisma.lead.findFirst({
      where: { id: targetId, tenantId },
      include: {
        property: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, displayName: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { activities: true } },
      },
    });
  }
}
