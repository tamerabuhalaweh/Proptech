// ============================================================
// Subscription Limit Guard — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionLimitGuard } from './subscription-limit.guard';
import { SubscriptionsService } from './subscriptions.service';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const mockSubscriptionsService = {
  checkLimit: jest.fn(),
};

function createMockContext(user?: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

describe('SubscriptionLimitGuard', () => {
  let guard: SubscriptionLimitGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionLimitGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    }).compile();

    guard = module.get<SubscriptionLimitGuard>(SubscriptionLimitGuard);
    jest.clearAllMocks();
  });

  it('should allow when no resource metadata configured', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({ tenantId: 't1' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow when no tenant context', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('properties');
    const context = createMockContext({ sub: 'user1' }); // no tenantId

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow when within limits', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('properties');
    mockSubscriptionsService.checkLimit.mockResolvedValue(true);
    const context = createMockContext({ sub: 'user1', tenantId: 't1' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockSubscriptionsService.checkLimit).toHaveBeenCalledWith('t1', 'properties');
  });

  it('should throw ForbiddenException when limit reached', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('properties');
    mockSubscriptionsService.checkLimit.mockResolvedValue(false);
    const context = createMockContext({ sub: 'user1', tenantId: 't1' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for units limit', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('units');
    mockSubscriptionsService.checkLimit.mockResolvedValue(false);
    const context = createMockContext({ sub: 'user1', tenantId: 't1' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Subscription limit reached for units',
    );
  });

  it('should check users limit', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('users');
    mockSubscriptionsService.checkLimit.mockResolvedValue(true);
    const context = createMockContext({ sub: 'user1', tenantId: 't1' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockSubscriptionsService.checkLimit).toHaveBeenCalledWith('t1', 'users');
  });
});
