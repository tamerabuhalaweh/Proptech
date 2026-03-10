// ============================================================
// Roles Guard — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

const mockReflector = {
  getAllAndOverride: jest.fn(),
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

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    jest.clearAllMocks();
  });

  it('should allow when no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({ role: UserRole.VIEWER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when roles array is empty', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockContext({ role: UserRole.VIEWER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.TENANT_ADMIN, UserRole.MANAGER]);
    const context = createMockContext({ role: UserRole.TENANT_ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny when user does not have required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    const context = createMockContext({ role: UserRole.VIEWER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny when no user in request', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.TENANT_ADMIN]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN for admin-only routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    const context = createMockContext({ role: UserRole.SUPER_ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny BROKER for admin-only routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN]);
    const context = createMockContext({ role: UserRole.BROKER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
