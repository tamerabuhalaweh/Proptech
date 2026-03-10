// ============================================================
// Subscriptions Controller — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

const mockSubscriptionsService = {
  create: jest.fn(),
  getCurrent: jest.fn(),
  getUsageStats: jest.fn(),
  upgrade: jest.fn(),
  downgrade: jest.fn(),
  checkLimit: jest.fn(),
};

const mockUser = {
  sub: 'user1',
  email: 'test@test.com',
  role: 'TENANT_ADMIN',
  tenantId: 't1',
};

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrent', () => {
    it('should return current subscription with usage', async () => {
      const expected = {
        plan: SubscriptionPlan.STARTER,
        status: SubscriptionStatus.ACTIVE,
        usage: {
          properties: { used: 2, limit: 5 },
          units: { used: 10, limit: 50 },
          users: { used: 1, limit: 3 },
        },
      };
      mockSubscriptionsService.getCurrent.mockResolvedValue(expected);

      const result = await controller.getCurrent(mockUser as any);

      expect(mockSubscriptionsService.getCurrent).toHaveBeenCalledWith('t1');
      expect(result.usage.properties.used).toBe(2);
    });
  });

  describe('getUsage', () => {
    it('should return usage statistics', async () => {
      const expected = {
        plan: SubscriptionPlan.STARTER,
        properties: { used: 2, limit: 5, remaining: 3, percentage: 40 },
      };
      mockSubscriptionsService.getUsageStats.mockResolvedValue(expected);

      const result = await controller.getUsage(mockUser as any);

      expect(mockSubscriptionsService.getUsageStats).toHaveBeenCalledWith('t1');
      expect(result.properties.percentage).toBe(40);
    });
  });

  describe('upgrade', () => {
    it('should upgrade the subscription plan', async () => {
      const expected = { plan: SubscriptionPlan.PROFESSIONAL };
      mockSubscriptionsService.upgrade.mockResolvedValue(expected);

      const result = await controller.upgrade(
        mockUser as any,
        { plan: SubscriptionPlan.PROFESSIONAL },
      );

      expect(mockSubscriptionsService.upgrade).toHaveBeenCalledWith(
        't1',
        { plan: SubscriptionPlan.PROFESSIONAL },
        'user1',
      );
      expect(result.plan).toBe(SubscriptionPlan.PROFESSIONAL);
    });
  });

  describe('downgrade', () => {
    it('should downgrade the subscription plan', async () => {
      const expected = { plan: SubscriptionPlan.STARTER };
      mockSubscriptionsService.downgrade.mockResolvedValue(expected);

      const result = await controller.downgrade(
        mockUser as any,
        { plan: SubscriptionPlan.STARTER },
      );

      expect(mockSubscriptionsService.downgrade).toHaveBeenCalledWith(
        't1',
        { plan: SubscriptionPlan.STARTER },
        'user1',
      );
      expect(result.plan).toBe(SubscriptionPlan.STARTER);
    });
  });
});
