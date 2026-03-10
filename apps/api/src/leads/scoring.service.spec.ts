// ============================================================
// Scoring Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { LeadSource, LeadStage } from '@prisma/client';
import { ScoringService } from './scoring.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  lead: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBreakdown', () => {
    it('should score a lead with all factors', () => {
      const lead = {
        id: 'l1',
        tenantId: 't1',
        name: 'Test',
        email: 'test@test.com',
        phone: '+966501234567',
        source: LeadSource.REFERRAL,
        stage: LeadStage.QUALIFIED,
        score: 0,
        budget: 500000,
        budgetMax: null,
        propertyId: 'prop1',
        assignedTo: null,
        unitPreferences: {},
        notes: null,
        tags: [],
        lastContactedAt: new Date(), // contacted today
        nextFollowUpAt: null,
        wonAt: null,
        lostAt: null,
        lostReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const breakdown = service.calculateBreakdown(lead);

      // budget=15, email=10, phone=10, referral=20, qualified=15, recent_7d=10, property=10 = 90
      expect(breakdown.totalScore).toBe(90);
      expect(breakdown.factors).toHaveLength(7);
      expect(breakdown.factors.map((f) => f.factor)).toContain('budget');
      expect(breakdown.factors.map((f) => f.factor)).toContain('email');
      expect(breakdown.factors.map((f) => f.factor)).toContain('phone');
      expect(breakdown.factors.map((f) => f.factor)).toContain('source');
      expect(breakdown.factors.map((f) => f.factor)).toContain('stage');
      expect(breakdown.factors.map((f) => f.factor)).toContain('recent_activity');
      expect(breakdown.factors.map((f) => f.factor)).toContain('property_interest');
    });

    it('should score a minimal lead (NEW, no contact info)', () => {
      const lead = {
        id: 'l2',
        tenantId: 't1',
        name: 'Minimal',
        email: null,
        phone: null,
        source: LeadSource.SOCIAL,
        stage: LeadStage.NEW,
        score: 0,
        budget: null,
        budgetMax: null,
        propertyId: null,
        assignedTo: null,
        unitPreferences: {},
        notes: null,
        tags: [],
        lastContactedAt: null,
        nextFollowUpAt: null,
        wonAt: null,
        lostAt: null,
        lostReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const breakdown = service.calculateBreakdown(lead);

      // Only source: SOCIAL=5
      expect(breakdown.totalScore).toBe(5);
      expect(breakdown.factors).toHaveLength(1);
    });

    it('should cap score at 100', () => {
      const lead = {
        id: 'l3',
        tenantId: 't1',
        name: 'Max',
        email: 'max@test.com',
        phone: '+966501234567',
        source: LeadSource.REFERRAL,
        stage: LeadStage.NEGOTIATION,
        score: 0,
        budget: 1000000,
        budgetMax: null,
        propertyId: 'prop1',
        assignedTo: null,
        unitPreferences: {},
        notes: null,
        tags: [],
        lastContactedAt: new Date(),
        nextFollowUpAt: null,
        wonAt: null,
        lostAt: null,
        lostReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const breakdown = service.calculateBreakdown(lead);

      // budget=15, email=10, phone=10, referral=20, negotiation=30, recent_7d=10, property=10 = 105 → capped at 100
      expect(breakdown.totalScore).toBe(100);
    });

    it('should give 5 points for contact in last 30 days', () => {
      const thirteenDaysAgo = new Date();
      thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

      const lead = {
        id: 'l4',
        tenantId: 't1',
        name: 'Recent',
        email: null,
        phone: null,
        source: LeadSource.WEBSITE,
        stage: LeadStage.NEW,
        score: 0,
        budget: null,
        budgetMax: null,
        propertyId: null,
        assignedTo: null,
        unitPreferences: {},
        notes: null,
        tags: [],
        lastContactedAt: thirteenDaysAgo,
        nextFollowUpAt: null,
        wonAt: null,
        lostAt: null,
        lostReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const breakdown = service.calculateBreakdown(lead);

      const recentFactor = breakdown.factors.find((f) => f.factor === 'recent_activity');
      expect(recentFactor).toBeDefined();
      expect(recentFactor!.points).toBe(5);
    });
  });

  describe('recalculate', () => {
    it('should update lead score in database', async () => {
      const lead = {
        id: 'l1',
        tenantId: 't1',
        name: 'Test',
        email: 'test@test.com',
        phone: null,
        source: LeadSource.WEBSITE,
        stage: LeadStage.NEW,
        score: 0,
        budget: null,
        budgetMax: null,
        propertyId: null,
        assignedTo: null,
        unitPreferences: {},
        notes: null,
        tags: [],
        lastContactedAt: null,
        nextFollowUpAt: null,
        wonAt: null,
        lostAt: null,
        lostReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.lead.findUnique.mockResolvedValue(lead);
      mockPrisma.lead.update.mockResolvedValue({ ...lead, score: 20 });

      const score = await service.recalculate('l1');

      // email=10 + website=10 = 20
      expect(score).toBe(20);
      expect(mockPrisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'l1' },
        data: { score: 20 },
      });
    });

    it('should return 0 if lead not found', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(null);

      const score = await service.recalculate('nonexistent');
      expect(score).toBe(0);
    });
  });
});
