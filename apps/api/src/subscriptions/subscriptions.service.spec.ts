// ============================================================
// Subscriptions Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus, BillingCycle } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
  },
  subscription: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  property: {
    count: jest.fn(),
  },
  unit: {
    count: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription for a tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', name: 'Test' });
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      const created = {
        id: 'sub1',
        tenantId: 't1',
        plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.TRIAL,
      };
      mockPrisma.subscription.create.mockResolvedValue(created);

      const result = await service.create({ tenantId: 't1' }, 'user1');

      expect(result.plan).toBe(SubscriptionPlan.STARTER);
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'created' }),
      );
    });

    it('should reject if tenant already has subscription', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.subscription.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ tenantId: 't1' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ tenantId: 'nonexistent' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrent', () => {
    it('should return subscription with usage', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub1',
        tenantId: 't1',
        plan: SubscriptionPlan.STARTER,
        maxProperties: 5,
        maxUnits: 50,
        maxUsers: 3,
        storageGB: 1,
      });
      mockPrisma.property.count.mockResolvedValue(2);
      mockPrisma.unit.count.mockResolvedValue(10);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.getCurrent('t1');

      expect(result.usage.properties.used).toBe(2);
      expect(result.usage.properties.limit).toBe(5);
      expect(result.usage.units.used).toBe(10);
      expect(result.usage.users.used).toBe(1);
    });

    it('should throw if no subscription found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      await expect(service.getCurrent('t1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upgrade', () => {
    it('should upgrade from STARTER to PROFESSIONAL', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub1',
        tenantId: 't1',
        plan: SubscriptionPlan.STARTER,
        billingCycle: BillingCycle.MONTHLY,
      });
      mockPrisma.subscription.update.mockResolvedValue({
        id: 'sub1',
        plan: SubscriptionPlan.PROFESSIONAL,
        maxProperties: 25,
        maxUnits: 500,
        maxUsers: 15,
      });

      const result = await service.upgrade('t1', { plan: SubscriptionPlan.PROFESSIONAL }, 'user1');

      expect(result.plan).toBe(SubscriptionPlan.PROFESSIONAL);
      expect(result.maxProperties).toBe(25);
    });

    it('should reject upgrading to same or lower plan', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub1',
        plan: SubscriptionPlan.PROFESSIONAL,
      });

      await expect(
        service.upgrade('t1', { plan: SubscriptionPlan.STARTER }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('downgrade', () => {
    it('should downgrade if usage fits new limits', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub1',
        tenantId: 't1',
        plan: SubscriptionPlan.PROFESSIONAL,
        billingCycle: BillingCycle.MONTHLY,
      });
      mockPrisma.property.count.mockResolvedValue(3);
      mockPrisma.unit.count.mockResolvedValue(20);
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.subscription.update.mockResolvedValue({
        id: 'sub1',
        plan: SubscriptionPlan.STARTER,
        maxProperties: 5,
      });

      const result = await service.downgrade('t1', { plan: SubscriptionPlan.STARTER }, 'user1');
      expect(result.plan).toBe(SubscriptionPlan.STARTER);
    });

    it('should reject downgrade if usage exceeds new limits', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub1',
        tenantId: 't1',
        plan: SubscriptionPlan.PROFESSIONAL,
        billingCycle: BillingCycle.MONTHLY,
      });
      mockPrisma.property.count.mockResolvedValue(10); // exceeds Starter's 5
      mockPrisma.unit.count.mockResolvedValue(100); // exceeds Starter's 50
      mockPrisma.user.count.mockResolvedValue(2);

      await expect(
        service.downgrade('t1', { plan: SubscriptionPlan.STARTER }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkLimit', () => {
    it('should return true when within limits', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        tenantId: 't1',
        status: SubscriptionStatus.ACTIVE,
        maxProperties: 5,
        maxUnits: 50,
        maxUsers: 3,
      });
      mockPrisma.property.count.mockResolvedValue(2);
      mockPrisma.unit.count.mockResolvedValue(10);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.checkLimit('t1', 'properties');
      expect(result).toBe(true);
    });

    it('should return false when at limit', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        tenantId: 't1',
        status: SubscriptionStatus.ACTIVE,
        maxProperties: 5,
        maxUnits: 50,
        maxUsers: 3,
      });
      mockPrisma.property.count.mockResolvedValue(5);
      mockPrisma.unit.count.mockResolvedValue(10);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.checkLimit('t1', 'properties');
      expect(result).toBe(false);
    });

    it('should return false when no subscription', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.checkLimit('t1', 'properties');
      expect(result).toBe(false);
    });
  });
});
