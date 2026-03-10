// ============================================================
// Assignment Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentStrategy } from './dto';

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('configureRules', () => {
    it('should save round-robin rules', async () => {
      mockPrisma.tenant.update.mockResolvedValue({});

      const result = await service.configureRules('t1', {
        strategy: AssignmentStrategy.ROUND_ROBIN,
        userIds: ['user1', 'user2', 'user3'],
      });

      expect(result.strategy).toBe(AssignmentStrategy.ROUND_ROBIN);
      expect(result.userIds).toEqual(['user1', 'user2', 'user3']);
      expect(mockPrisma.tenant.update).toHaveBeenCalled();
    });
  });

  describe('autoAssign', () => {
    it('should return null if no rules configured', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ config: {} });

      const result = await service.autoAssign('t1', 'WEBSITE');
      expect(result).toBeNull();
    });

    it('should do round-robin assignment', async () => {
      mockPrisma.tenant.update.mockResolvedValue({});

      // Configure rules first
      await service.configureRules('t1', {
        strategy: AssignmentStrategy.ROUND_ROBIN,
        userIds: ['user1', 'user2', 'user3'],
      });

      // First call → user1
      const first = await service.autoAssign('t1', 'WEBSITE');
      expect(first).toBe('user1');

      // Second call → user2
      const second = await service.autoAssign('t1', 'WEBSITE');
      expect(second).toBe('user2');

      // Third call → user3
      const third = await service.autoAssign('t1', 'WEBSITE');
      expect(third).toBe('user3');

      // Fourth call → back to user1
      const fourth = await service.autoAssign('t1', 'WEBSITE');
      expect(fourth).toBe('user1');
    });

    it('should assign by property', async () => {
      mockPrisma.tenant.update.mockResolvedValue({});

      await service.configureRules('t1', {
        strategy: AssignmentStrategy.BY_PROPERTY,
        userIds: [],
        propertyMapping: { prop1: 'user1', prop2: 'user2' },
      });

      const result = await service.autoAssign('t1', 'WEBSITE', 'prop1');
      expect(result).toBe('user1');

      const result2 = await service.autoAssign('t1', 'WEBSITE', 'prop2');
      expect(result2).toBe('user2');

      // Unknown property
      const result3 = await service.autoAssign('t1', 'WEBSITE', 'prop3');
      expect(result3).toBeNull();
    });

    it('should assign by source', async () => {
      mockPrisma.tenant.update.mockResolvedValue({});

      await service.configureRules('t1', {
        strategy: AssignmentStrategy.BY_SOURCE,
        userIds: [],
        sourceMapping: { WEBSITE: 'user1', REFERRAL: 'user2' },
      });

      const result = await service.autoAssign('t1', 'WEBSITE');
      expect(result).toBe('user1');

      const result2 = await service.autoAssign('t1', 'REFERRAL');
      expect(result2).toBe('user2');

      // Unknown source
      const result3 = await service.autoAssign('t1', 'SOCIAL');
      expect(result3).toBeNull();
    });
  });
});
