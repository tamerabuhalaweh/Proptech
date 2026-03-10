import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  activityLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an activity log entry', async () => {
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'log1' });

      await service.log({
        tenantId: 't1',
        entityType: 'property',
        entityId: 'p1',
        action: 'created',
        description: 'Property created',
        performedBy: 'user1',
      });

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 't1',
          entityType: 'property',
          action: 'created',
        }),
      });
    });

    it('should not throw if logging fails', async () => {
      mockPrisma.activityLog.create.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(
        service.log({
          tenantId: 't1',
          entityType: 'property',
          entityId: 'p1',
          action: 'created',
          description: 'Test',
          performedBy: 'user1',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity logs', async () => {
      const logs = [{ id: 'a1' }, { id: 'a2' }];
      mockPrisma.activityLog.findMany.mockResolvedValue(logs);

      const result = await service.getRecentActivity('t1', 10);

      expect(result).toHaveLength(2);
      expect(mockPrisma.activityLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });
});
