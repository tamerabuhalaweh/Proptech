// ============================================================
// Activities Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ScoringService } from './scoring.service';

const mockPrisma = {
  lead: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  leadActivity: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };
const mockScoring = { recalculate: jest.fn().mockResolvedValue(50) };

describe('ActivitiesService', () => {
  let service: ActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
        { provide: ScoringService, useValue: mockScoring },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity for a lead', async () => {
      const lead = { id: 'l1', tenantId: 't1', name: 'Test', deletedAt: null };
      mockPrisma.lead.findFirst.mockResolvedValue(lead);

      const dto = {
        type: ActivityType.CALL,
        title: 'Follow-up call',
        description: 'Discuss pricing',
      };

      const created = {
        id: 'act1',
        ...dto,
        tenantId: 't1',
        leadId: 'l1',
        performedBy: 'user1',
        lead: { id: 'l1', name: 'Test' },
      };
      mockPrisma.leadActivity.create.mockResolvedValue(created);
      mockPrisma.lead.update.mockResolvedValue({});

      const result = await service.create('t1', 'l1', dto, 'user1');

      expect(result.id).toBe('act1');
      expect(mockPrisma.leadActivity.create).toHaveBeenCalled();
      expect(mockPrisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'l1' },
        data: { lastContactedAt: expect.any(Date) },
      });
      expect(mockScoring.recalculate).toHaveBeenCalledWith('l1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'lead_activity', action: 'created' }),
      );
    });

    it('should throw NotFoundException if lead does not exist', async () => {
      mockPrisma.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.create('t1', 'nonexistent', { type: ActivityType.NOTE, title: 'Test' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete an activity with outcome', async () => {
      const existing = {
        id: 'act1',
        tenantId: 't1',
        leadId: 'l1',
        title: 'Follow-up call',
        description: 'Some notes',
        lead: { id: 'l1', name: 'Test' },
      };
      mockPrisma.leadActivity.findFirst.mockResolvedValue(existing);

      const updated = {
        ...existing,
        completedAt: new Date(),
        outcome: 'Client interested',
      };
      mockPrisma.leadActivity.update.mockResolvedValue(updated);
      mockPrisma.lead.update.mockResolvedValue({});

      const result = await service.complete('t1', 'act1', { outcome: 'Client interested' }, 'user1');

      expect(result.completedAt).toBeDefined();
      expect(result.outcome).toBe('Client interested');
      expect(mockScoring.recalculate).toHaveBeenCalledWith('l1');
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming activities for user', async () => {
      const activities = [
        { id: 'act1', title: 'Call', scheduledAt: new Date(Date.now() + 86400000) },
      ];
      mockPrisma.leadActivity.findMany.mockResolvedValue(activities);

      const result = await service.getUpcoming('t1', 'user1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.leadActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            performedBy: 'user1',
            completedAt: null,
          }),
        }),
      );
    });
  });

  describe('getOverdue', () => {
    it('should return overdue activities', async () => {
      const activities = [
        { id: 'act1', title: 'Missed call', scheduledAt: new Date(Date.now() - 86400000) },
      ];
      mockPrisma.leadActivity.findMany.mockResolvedValue(activities);

      const result = await service.getOverdue('t1', 'user1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.leadActivity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            performedBy: 'user1',
            completedAt: null,
            scheduledAt: { lt: expect.any(Date) },
          }),
        }),
      );
    });
  });

  describe('findByLead', () => {
    it('should return paginated activities for a lead', async () => {
      mockPrisma.leadActivity.findMany.mockResolvedValue([{ id: 'act1' }]);
      mockPrisma.leadActivity.count.mockResolvedValue(1);

      const result = await service.findByLead('t1', 'l1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete activity and log', async () => {
      const existing = {
        id: 'act1',
        tenantId: 't1',
        leadId: 'l1',
        title: 'Test Activity',
        lead: { id: 'l1', name: 'Test' },
      };
      mockPrisma.leadActivity.findFirst.mockResolvedValue(existing);
      mockPrisma.leadActivity.delete.mockResolvedValue(existing);

      const result = await service.remove('t1', 'act1', 'user1');
      expect(result).toHaveProperty('message');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
    });
  });
});
