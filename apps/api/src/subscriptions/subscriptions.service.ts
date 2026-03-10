// ============================================================
// Subscriptions Service — Plan management, limits, usage
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateSubscriptionDto, UpgradeSubscriptionDto } from './dto';

/** Plan limits configuration */
const PLAN_LIMITS: Record<SubscriptionPlan, {
  maxProperties: number;
  maxUnits: number;
  maxUsers: number;
  storageGB: number;
}> = {
  [SubscriptionPlan.STARTER]: { maxProperties: 5, maxUnits: 50, maxUsers: 3, storageGB: 1 },
  [SubscriptionPlan.PROFESSIONAL]: { maxProperties: 25, maxUnits: 500, maxUsers: 15, storageGB: 10 },
  [SubscriptionPlan.ENTERPRISE]: { maxProperties: 999999, maxUnits: 999999, maxUsers: 999999, storageGB: 1000 },
};

/** Plan hierarchy for upgrade/downgrade validation */
const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.STARTER]: 0,
  [SubscriptionPlan.PROFESSIONAL]: 1,
  [SubscriptionPlan.ENTERPRISE]: 2,
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Get current tenant usage counts
   */
  private async getUsage(tenantId: string) {
    const [propertiesCount, unitsCount, usersCount] = await Promise.all([
      this.prisma.property.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.unit.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);
    return { propertiesCount, unitsCount, usersCount };
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(start: Date, cycle: BillingCycle): Date {
    const end = new Date(start);
    if (cycle === BillingCycle.ANNUAL) {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  /**
   * Create a subscription for a tenant
   */
  async create(dto: CreateSubscriptionDto, userId: string) {
    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${dto.tenantId}" not found`);
    }

    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId: dto.tenantId },
    });
    if (existing) {
      throw new BadRequestException('Tenant already has a subscription');
    }

    const plan = dto.plan || SubscriptionPlan.STARTER;
    const billingCycle = dto.billingCycle || BillingCycle.MONTHLY;
    const limits = PLAN_LIMITS[plan];
    const now = new Date();
    const trialEnd = dto.trialEndsAt ? new Date(dto.trialEndsAt) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId: dto.tenantId,
        plan,
        status: SubscriptionStatus.TRIAL,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: this.calculatePeriodEnd(now, billingCycle),
        trialEndsAt: trialEnd,
        ...limits,
      },
    });

    await this.activity.log({
      tenantId: dto.tenantId,
      entityType: 'subscription',
      entityId: subscription.id,
      action: 'created',
      description: `Subscription created: ${plan} plan (${billingCycle})`,
      performedBy: userId,
    });

    this.logger.log(`Subscription created: ${subscription.id} for tenant ${dto.tenantId}`);
    return subscription;
  }

  /**
   * Get current subscription with usage stats
   */
  async getCurrent(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this tenant');
    }

    const usage = await this.getUsage(tenantId);

    return {
      ...subscription,
      usage: {
        properties: { used: usage.propertiesCount, limit: subscription.maxProperties },
        units: { used: usage.unitsCount, limit: subscription.maxUnits },
        users: { used: usage.usersCount, limit: subscription.maxUsers },
        storage: { used: 0, limit: subscription.storageGB }, // placeholder for actual storage calc
      },
    };
  }

  /**
   * Get usage vs limits
   */
  async getUsageStats(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this tenant');
    }

    const usage = await this.getUsage(tenantId);

    return {
      plan: subscription.plan,
      status: subscription.status,
      properties: {
        used: usage.propertiesCount,
        limit: subscription.maxProperties,
        remaining: Math.max(0, subscription.maxProperties - usage.propertiesCount),
        percentage: Math.round((usage.propertiesCount / subscription.maxProperties) * 100),
      },
      units: {
        used: usage.unitsCount,
        limit: subscription.maxUnits,
        remaining: Math.max(0, subscription.maxUnits - usage.unitsCount),
        percentage: Math.round((usage.unitsCount / subscription.maxUnits) * 100),
      },
      users: {
        used: usage.usersCount,
        limit: subscription.maxUsers,
        remaining: Math.max(0, subscription.maxUsers - usage.usersCount),
        percentage: Math.round((usage.usersCount / subscription.maxUsers) * 100),
      },
      storage: {
        used: 0,
        limit: subscription.storageGB,
        remaining: subscription.storageGB,
        percentage: 0,
      },
    };
  }

  /**
   * Upgrade subscription plan
   */
  async upgrade(tenantId: string, dto: UpgradeSubscriptionDto, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this tenant');
    }

    if (PLAN_ORDER[dto.plan] <= PLAN_ORDER[subscription.plan]) {
      throw new BadRequestException(
        `Cannot upgrade from ${subscription.plan} to ${dto.plan}. Target plan must be higher.`,
      );
    }

    const limits = PLAN_LIMITS[dto.plan];
    const billingCycle = dto.billingCycle || subscription.billingCycle;
    const now = new Date();

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        plan: dto.plan,
        status: SubscriptionStatus.ACTIVE,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: this.calculatePeriodEnd(now, billingCycle),
        ...limits,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'subscription',
      entityId: updated.id,
      action: 'upgraded',
      description: `Subscription upgraded: ${subscription.plan} → ${dto.plan}`,
      performedBy: userId,
      metadata: { fromPlan: subscription.plan, toPlan: dto.plan },
    });

    this.logger.log(`Subscription upgraded: ${subscription.plan} → ${dto.plan} for tenant ${tenantId}`);
    return updated;
  }

  /**
   * Downgrade subscription plan (validates usage fits new limits)
   */
  async downgrade(tenantId: string, dto: UpgradeSubscriptionDto, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found for this tenant');
    }

    if (PLAN_ORDER[dto.plan] >= PLAN_ORDER[subscription.plan]) {
      throw new BadRequestException(
        `Cannot downgrade from ${subscription.plan} to ${dto.plan}. Target plan must be lower.`,
      );
    }

    // Check current usage fits new plan limits
    const usage = await this.getUsage(tenantId);
    const newLimits = PLAN_LIMITS[dto.plan];
    const violations: string[] = [];

    if (usage.propertiesCount > newLimits.maxProperties) {
      violations.push(`Properties: ${usage.propertiesCount} used, limit ${newLimits.maxProperties}`);
    }
    if (usage.unitsCount > newLimits.maxUnits) {
      violations.push(`Units: ${usage.unitsCount} used, limit ${newLimits.maxUnits}`);
    }
    if (usage.usersCount > newLimits.maxUsers) {
      violations.push(`Users: ${usage.usersCount} used, limit ${newLimits.maxUsers}`);
    }

    if (violations.length > 0) {
      throw new BadRequestException(
        `Cannot downgrade: current usage exceeds ${dto.plan} limits. ${violations.join('; ')}`,
      );
    }

    const billingCycle = dto.billingCycle || subscription.billingCycle;
    const now = new Date();

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        plan: dto.plan,
        billingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: this.calculatePeriodEnd(now, billingCycle),
        ...newLimits,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'subscription',
      entityId: updated.id,
      action: 'downgraded',
      description: `Subscription downgraded: ${subscription.plan} → ${dto.plan}`,
      performedBy: userId,
      metadata: { fromPlan: subscription.plan, toPlan: dto.plan },
    });

    this.logger.log(`Subscription downgraded: ${subscription.plan} → ${dto.plan} for tenant ${tenantId}`);
    return updated;
  }

  /**
   * Check if an action is within subscription limits
   * Used as a utility by other services/guards
   */
  async checkLimit(tenantId: string, resource: 'properties' | 'units' | 'users'): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return false; // no subscription = no access
    }

    if (subscription.status === SubscriptionStatus.CANCELLED || subscription.status === SubscriptionStatus.EXPIRED) {
      return false;
    }

    const usage = await this.getUsage(tenantId);

    switch (resource) {
      case 'properties':
        return usage.propertiesCount < subscription.maxProperties;
      case 'units':
        return usage.unitsCount < subscription.maxUnits;
      case 'users':
        return usage.usersCount < subscription.maxUsers;
      default:
        return false;
    }
  }
}
