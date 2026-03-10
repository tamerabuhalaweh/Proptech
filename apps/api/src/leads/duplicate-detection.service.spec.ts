// ============================================================
// Duplicate Detection Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockTx = {
  leadActivity: { updateMany: jest.fn(), create: jest.fn() },
  booking: { updateMany: jest.fn() },
  lead: { update: jest.fn() },
};

const mockPrisma = {
  lead: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  leadActivity: {
    updateMany: jest.fn(),
    create: jest.fn(),
  },
  booking: {
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(mockTx)),
};

const mockActivity = { log: jest.fn() };

describe('DuplicateDetectionService', () => {
  let service: DuplicateDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DuplicateDetectionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<DuplicateDetectionService>(DuplicateDetectionService);
    jest.resetAllMocks();
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockTx));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizePhone', () => {
    it('should normalize +966 prefix', () => {
      expect(service.normalizePhone('+966 501234567')).toBe('+966501234567');
    });

    it('should handle 05 prefix (Saudi mobile)', () => {
      expect(service.normalizePhone('0501234567')).toBe('+966501234567');
    });

    it('should strip dashes and spaces', () => {
      expect(service.normalizePhone('+966-50-123-4567')).toBe('+966501234567');
    });

    it('should handle 00966 prefix', () => {
      expect(service.normalizePhone('00966501234567')).toBe('+966501234567');
    });

    it('should handle bare 9-digit number', () => {
      expect(service.normalizePhone('501234567')).toBe('+966501234567');
    });
  });

  describe('checkDuplicates', () => {
    it('should find exact email match with high confidence', async () => {
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([
          { id: 'l1', name: 'Ahmed', email: 'ahmed@test.com', phone: null },
        ]) // email match
        .mockResolvedValueOnce([]) // phone match
        .mockResolvedValueOnce([]) // fuzzy name+phone
        .mockResolvedValueOnce([]); // fuzzy name alone

      const result = await service.checkDuplicates('t1', {
        name: 'Ahmed',
        email: 'ahmed@test.com',
      });

      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(95);
      expect(result[0].matchReasons).toContain('Exact email match');
    });

    it('should find normalized phone match', async () => {
      const phoneLeads = [
        { id: 'l1', name: 'Ahmed', email: null, phone: '0501234567' },
      ];
      // No email in dto → email findMany is skipped
      // Calls: phone normalization, fuzzy name+phone, fuzzy name alone
      mockPrisma.lead.findMany
        .mockResolvedValueOnce(phoneLeads) // phone normalization check
        .mockResolvedValueOnce(phoneLeads) // fuzzy name+phone check
        .mockResolvedValueOnce([]); // fuzzy name alone

      const result = await service.checkDuplicates('t1', {
        name: 'Ahmed',
        phone: '+966501234567',
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].confidence).toBeGreaterThanOrEqual(90);
    });

    it('should return empty for no matches', async () => {
      // Has email but no phone → calls: email match, fuzzy name alone
      mockPrisma.lead.findMany
        .mockResolvedValueOnce([]) // email match
        .mockResolvedValueOnce([]); // fuzzy name alone

      const result = await service.checkDuplicates('t1', {
        name: 'Unique Name',
        email: 'unique@test.com',
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('mergeLeads', () => {
    it('should merge source into target', async () => {
      const target = {
        id: 'target1',
        tenantId: 't1',
        name: 'Ahmed',
        email: 'ahmed@test.com',
        phone: null,
        tags: ['VIP'],
        budget: 500000,
        budgetMax: null,
        propertyId: null,
        notes: 'Target notes',
        deletedAt: null,
      };
      const source = {
        id: 'source1',
        tenantId: 't1',
        name: 'Ahmed R.',
        email: null,
        phone: '+966501234567',
        tags: ['investor'],
        budget: null,
        budgetMax: 1000000,
        propertyId: 'p1',
        notes: 'Source notes',
        deletedAt: null,
      };

      mockPrisma.lead.findFirst
        .mockResolvedValueOnce(target)
        .mockResolvedValueOnce(source)
        .mockResolvedValueOnce({ ...target, activities: [] }); // final return

      await service.mergeLeads('t1', 'target1', 'source1', 'user1');

      expect(mockTx.leadActivity.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { leadId: 'source1' },
          data: { leadId: 'target1' },
        }),
      );
      expect(mockTx.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'source1' } }),
      );
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'merged' }),
      );
    });

    it('should reject merging a lead with itself', async () => {
      mockPrisma.lead.findFirst.mockResolvedValue({
        id: 'l1',
        tenantId: 't1',
        name: 'Test',
        deletedAt: null,
      });

      await expect(
        service.mergeLeads('t1', 'l1', 'l1', 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if target not found', async () => {
      mockPrisma.lead.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.mergeLeads('t1', 'nonexistent', 'source1', 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
