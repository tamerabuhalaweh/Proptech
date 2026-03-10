// ============================================================
// Leads Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadStage, LeadSource } from '@prisma/client';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ScoringService } from './scoring.service';
import { PipelineService } from './pipeline.service';
import { AssignmentService } from './assignment.service';

const mockPrisma = {
  lead: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  leadActivity: {
    create: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

const mockScoring = {
  recalculate: jest.fn().mockResolvedValue(50),
  getBreakdown: jest.fn(),
};

const mockPipeline = {
  validateTransition: jest.fn(),
  getStats: jest.fn(),
};

const mockAssignment = {
  autoAssign: jest.fn().mockResolvedValue(null),
  configureRules: jest.fn(),
  getRules: jest.fn(),
};

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
        { provide: ScoringService, useValue: mockScoring },
        { provide: PipelineService, useValue: mockPipeline },
        { provide: AssignmentService, useValue: mockAssignment },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a lead, auto-score, and log activity', async () => {
      const dto = { name: 'Ahmed Al-Rashid', email: 'ahmed@test.com', source: LeadSource.WEBSITE };
      const created = {
        id: 'lead1',
        ...dto,
        tenantId: 't1',
        stage: LeadStage.NEW,
        score: 0,
        assignedTo: null,
        property: null,
        assignedUser: null,
        _count: { activities: 0 },
      };

      mockPrisma.lead.create.mockResolvedValue(created);
      mockPrisma.lead.findFirst.mockResolvedValue({
        ...created,
        activities: [],
      });

      const result = await service.create('t1', dto, 'user1');

      expect(result.id).toBe('lead1');
      expect(mockPrisma.lead.create).toHaveBeenCalled();
      expect(mockScoring.recalculate).toHaveBeenCalledWith('lead1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 't1',
          entityType: 'lead',
          action: 'created',
        }),
      );
    });

    it('should auto-assign lead when no assignee provided', async () => {
      mockAssignment.autoAssign.mockResolvedValue('auto-user');
      const dto = { name: 'Test Lead' };
      const created = {
        id: 'lead2',
        name: dto.name,
        tenantId: 't1',
        stage: LeadStage.NEW,
        score: 0,
        assignedTo: 'auto-user',
        property: null,
        assignedUser: null,
        _count: { activities: 0 },
      };

      mockPrisma.lead.create.mockResolvedValue(created);
      mockPrisma.leadActivity.create.mockResolvedValue({});
      mockPrisma.lead.findFirst.mockResolvedValue({ ...created, activities: [] });

      await service.create('t1', dto, 'user1');

      expect(mockAssignment.autoAssign).toHaveBeenCalledWith('t1', 'WEBSITE', undefined);
      expect(mockPrisma.leadActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'ASSIGNMENT' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated leads', async () => {
      const leads = [
        { id: 'l1', name: 'Lead 1' },
        { id: 'l2', name: 'Lead 2' },
      ];
      mockPrisma.lead.findMany.mockResolvedValue(leads);
      mockPrisma.lead.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should apply filters', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([]);
      mockPrisma.lead.count.mockResolvedValue(0);

      await service.findAll('t1', { stage: LeadStage.QUALIFIED, source: LeadSource.REFERRAL });

      const where = mockPrisma.lead.findMany.mock.calls[0][0].where;
      expect(where.stage).toBe(LeadStage.QUALIFIED);
      expect(where.source).toBe(LeadSource.REFERRAL);
    });

    it('should restrict broker to assigned leads only', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([]);
      mockPrisma.lead.count.mockResolvedValue(0);

      const brokerUser = { sub: 'broker1', role: 'BROKER', tenantId: 't1', email: 'b@test.com' };
      await service.findAll('t1', {}, brokerUser);

      const where = mockPrisma.lead.findMany.mock.calls[0][0].where;
      expect(where.assignedTo).toBe('broker1');
    });
  });

  describe('findOne', () => {
    it('should return lead by id', async () => {
      const lead = { id: 'l1', tenantId: 't1', name: 'Test', deletedAt: null, activities: [] };
      mockPrisma.lead.findFirst.mockResolvedValue(lead);

      const result = await service.findOne('t1', 'l1');
      expect(result.id).toBe('l1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.lead.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStage', () => {
    it('should change stage and log transition', async () => {
      const lead = {
        id: 'l1',
        tenantId: 't1',
        name: 'Test',
        stage: LeadStage.NEW,
        score: 30,
        assignedTo: null,
        deletedAt: null,
        activities: [],
        _count: { activities: 0 },
      };
      mockPrisma.lead.findFirst.mockResolvedValue(lead);
      mockPrisma.lead.update.mockResolvedValue({ ...lead, stage: LeadStage.CONTACTED });
      mockPrisma.leadActivity.create.mockResolvedValue({});

      await service.changeStage('t1', 'l1', { stage: LeadStage.CONTACTED }, 'user1');

      expect(mockPipeline.validateTransition).toHaveBeenCalledWith(LeadStage.NEW, LeadStage.CONTACTED);
      expect(mockPrisma.lead.update).toHaveBeenCalled();
      expect(mockPrisma.leadActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'STAGE_CHANGE',
          }),
        }),
      );
      expect(mockScoring.recalculate).toHaveBeenCalledWith('l1');
    });
  });

  describe('assignLead', () => {
    it('should assign lead and log assignment activity', async () => {
      const lead = {
        id: 'l1',
        tenantId: 't1',
        name: 'Test',
        assignedTo: 'old-user',
        deletedAt: null,
        activities: [],
      };
      mockPrisma.lead.findFirst.mockResolvedValue(lead);
      mockPrisma.lead.update.mockResolvedValue({ ...lead, assignedTo: 'new-user' });
      mockPrisma.leadActivity.create.mockResolvedValue({});

      await service.assignLead('t1', 'l1', { assignedTo: 'new-user' }, 'manager1');

      expect(mockPrisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'l1' },
        data: { assignedTo: 'new-user' },
      });
      expect(mockPrisma.leadActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'ASSIGNMENT',
            metadata: expect.objectContaining({
              previousAssignee: 'old-user',
              newAssignee: 'new-user',
            }),
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete lead and log activity', async () => {
      const existing = {
        id: 'l1',
        tenantId: 't1',
        name: 'Test Lead',
        deletedAt: null,
        activities: [],
      };
      mockPrisma.lead.findFirst.mockResolvedValue(existing);
      mockPrisma.lead.update.mockResolvedValue({ ...existing, deletedAt: new Date() });

      const result = await service.remove('t1', 'l1', 'user1');
      expect(result).toHaveProperty('message');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
    });
  });
});
