// ============================================================
// Pipeline Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  lead: {
    groupBy: jest.fn(),
  },
  leadActivity: {
    findMany: jest.fn(),
  },
};

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTransition', () => {
    it('should allow NEW → CONTACTED', () => {
      expect(() => service.validateTransition(LeadStage.NEW, LeadStage.CONTACTED)).not.toThrow();
    });

    it('should allow CONTACTED → QUALIFIED', () => {
      expect(() => service.validateTransition(LeadStage.CONTACTED, LeadStage.QUALIFIED)).not.toThrow();
    });

    it('should allow QUALIFIED → PROPOSAL', () => {
      expect(() => service.validateTransition(LeadStage.QUALIFIED, LeadStage.PROPOSAL)).not.toThrow();
    });

    it('should allow PROPOSAL → NEGOTIATION', () => {
      expect(() => service.validateTransition(LeadStage.PROPOSAL, LeadStage.NEGOTIATION)).not.toThrow();
    });

    it('should allow NEGOTIATION → WON', () => {
      expect(() => service.validateTransition(LeadStage.NEGOTIATION, LeadStage.WON)).not.toThrow();
    });

    it('should allow LOST from any stage', () => {
      expect(() => service.validateTransition(LeadStage.NEW, LeadStage.LOST)).not.toThrow();
      expect(() => service.validateTransition(LeadStage.CONTACTED, LeadStage.LOST)).not.toThrow();
      expect(() => service.validateTransition(LeadStage.QUALIFIED, LeadStage.LOST)).not.toThrow();
      expect(() => service.validateTransition(LeadStage.PROPOSAL, LeadStage.LOST)).not.toThrow();
      expect(() => service.validateTransition(LeadStage.NEGOTIATION, LeadStage.LOST)).not.toThrow();
    });

    it('should NOT allow skipping stages (NEW → QUALIFIED)', () => {
      expect(() => service.validateTransition(LeadStage.NEW, LeadStage.QUALIFIED))
        .toThrow(BadRequestException);
    });

    it('should NOT allow skipping stages (NEW → PROPOSAL)', () => {
      expect(() => service.validateTransition(LeadStage.NEW, LeadStage.PROPOSAL))
        .toThrow(BadRequestException);
    });

    it('should NOT allow backward transitions (QUALIFIED → NEW)', () => {
      expect(() => service.validateTransition(LeadStage.QUALIFIED, LeadStage.NEW))
        .toThrow(BadRequestException);
    });

    it('should NOT allow same-stage transition', () => {
      expect(() => service.validateTransition(LeadStage.NEW, LeadStage.NEW))
        .toThrow(BadRequestException);
    });

    it('should NOT allow transition from WON', () => {
      expect(() => service.validateTransition(LeadStage.WON, LeadStage.NEW))
        .toThrow(BadRequestException);
    });

    it('should allow LOST → NEW (reopening)', () => {
      expect(() => service.validateTransition(LeadStage.LOST, LeadStage.NEW)).not.toThrow();
    });

    it('should NOT allow LOST → anything except NEW', () => {
      expect(() => service.validateTransition(LeadStage.LOST, LeadStage.CONTACTED))
        .toThrow(BadRequestException);
    });
  });

  describe('getStats', () => {
    it('should return pipeline statistics', async () => {
      mockPrisma.lead.groupBy.mockResolvedValue([
        { stage: LeadStage.NEW, _count: { id: 10 } },
        { stage: LeadStage.CONTACTED, _count: { id: 5 } },
        { stage: LeadStage.WON, _count: { id: 3 } },
        { stage: LeadStage.LOST, _count: { id: 2 } },
      ]);
      mockPrisma.leadActivity.findMany.mockResolvedValue([]);

      const stats = await service.getStats('t1');

      expect(stats.total).toBe(20);
      expect(stats.conversionRate).toBe(60); // 3/(3+2) * 100
      expect(stats.stages).toHaveLength(7); // all LeadStage values
    });
  });
});
