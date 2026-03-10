// ============================================================
// Lead Auto-Expiry Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { LeadStage } from '@prisma/client';
import { LeadExpiryService } from './lead-expiry.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockTx = {
  lead: { update: jest.fn() },
  leadActivity: { create: jest.fn() },
};

const mockPrisma = {
  lead: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  leadActivity: {
    create: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(mockTx)),
};

const mockActivity = { log: jest.fn() };

describe('LeadExpiryService', () => {
  let service: LeadExpiryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadExpiryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<LeadExpiryService>(LeadExpiryService);
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockTx));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processExpiry', () => {
    it('should expire inactive leads and set stage to LOST', async () => {
      const inactiveLeads = [
        { id: 'l1', name: 'Lead 1', stage: LeadStage.NEW },
        { id: 'l2', name: 'Lead 2', stage: LeadStage.CONTACTED },
      ];
      mockPrisma.lead.findMany.mockResolvedValue(inactiveLeads);

      const result = await service.processExpiry('t1', 'user1', 90);

      expect(result.expired).toBe(2);
      expect(result.processed).toBe(2);
      expect(result.inactiveDays).toBe(90);
      expect(mockTx.lead.update).toHaveBeenCalledTimes(2);
      expect(mockTx.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'l1' },
          data: expect.objectContaining({
            stage: LeadStage.LOST,
            lostReason: 'Auto-expired due to inactivity',
          }),
        }),
      );
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auto_expiry' }),
      );
    });

    it('should return zero when no inactive leads found', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([]);

      const result = await service.processExpiry('t1', 'user1');

      expect(result.expired).toBe(0);
      expect(result.processed).toBe(0);
    });

    it('should create stage change activity for each expired lead', async () => {
      mockPrisma.lead.findMany.mockResolvedValue([
        { id: 'l1', name: 'Lead 1', stage: LeadStage.QUALIFIED },
      ]);

      await service.processExpiry('t1', 'user1', 30);

      expect(mockTx.leadActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'STAGE_CHANGE',
            leadId: 'l1',
          }),
        }),
      );
    });
  });
});
