// ============================================================
// Pricing Service — Edge Case Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DiscountStatus } from '@prisma/client';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  unit: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  priceHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  discount: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('PricingService (Edge Cases)', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    jest.clearAllMocks();
  });

  describe('calculatePrice', () => {
    it('should throw NotFoundException when unit not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.calculatePrice('t1', { unitId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate correct price with no discounts', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 500000,
        floor: 5,
        discounts: [],
      });

      const result = await service.calculatePrice('t1', {
        unitId: 'u1',
        floorPremium: 10000,
        viewPremium: 25000,
        featurePremiums: [5000, 3000],
      });

      expect(result.breakdown.basePrice).toBe(500000);
      expect(result.breakdown.floorPremium).toBe(50000); // 10000 * 5
      expect(result.breakdown.viewPremium).toBe(25000);
      expect(result.breakdown.featurePremiums).toBe(8000);
      expect(result.breakdown.grossPrice).toBe(583000);
      expect(result.breakdown.finalPrice).toBe(583000);
      expect(result.activeDiscounts).toBe(0);
    });

    it('should apply percentage discount correctly', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 1000000,
        floor: 1,
        discounts: [
          { type: 'percentage', value: 10, status: DiscountStatus.APPROVED },
        ],
      });

      const result = await service.calculatePrice('t1', { unitId: 'u1' });

      expect(result.breakdown.grossPrice).toBe(1000000);
      expect(result.breakdown.totalDiscount).toBe(100000);
      expect(result.breakdown.finalPrice).toBe(900000);
    });

    it('should not allow negative final price', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 100000,
        floor: 1,
        discounts: [
          { type: 'fixed', value: 200000, status: DiscountStatus.APPROVED },
        ],
      });

      const result = await service.calculatePrice('t1', { unitId: 'u1' });

      expect(result.breakdown.finalPrice).toBe(0); // Math.max(0, ...)
    });
  });

  describe('updatePrice', () => {
    it('should throw NotFoundException for nonexistent unit', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePrice('t1', { unitId: 'nonexistent', newPrice: 600000 } as any, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should record price history', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 500000,
      });
      mockPrisma.priceHistory.create.mockResolvedValue({});
      mockPrisma.unit.update.mockResolvedValue({ id: 'u1', basePrice: 600000 });

      await service.updatePrice('t1', {
        unitId: 'u1',
        newPrice: 600000,
        reason: 'Market adjustment',
      } as any, 'user1');

      expect(mockPrisma.priceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 't1',
          unitId: 'u1',
          oldPrice: 500000,
          newPrice: 600000,
          reason: 'Market adjustment',
        }),
      });
    });
  });

  describe('createDiscount', () => {
    it('should throw NotFoundException for nonexistent unit', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.createDiscount('t1', {
          unitId: 'nonexistent',
          type: 'percentage',
          value: 10,
        } as any, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject percentage discount > 100', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({ id: 'u1' });

      await expect(
        service.createDiscount('t1', {
          unitId: 'u1',
          type: 'percentage',
          value: 150,
        } as any, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid fixed discount', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({ id: 'u1' });
      const disc = { id: 'disc1', unit: { unitNumber: 'A-101' } };
      mockPrisma.discount.create.mockResolvedValue(disc);

      const result = await service.createDiscount('t1', {
        unitId: 'u1',
        type: 'fixed',
        value: 50000,
        reason: 'Early bird',
      } as any, 'user1');

      expect(result.id).toBe('disc1');
    });
  });

  describe('approveDiscount', () => {
    it('should throw NotFoundException for nonexistent discount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue(null);

      await expect(
        service.approveDiscount('t1', 'nonexistent', {
          status: DiscountStatus.APPROVED,
        } as any, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject re-approving already approved discount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc1',
        status: DiscountStatus.APPROVED,
        unit: { unitNumber: 'A-101' },
      });

      await expect(
        service.approveDiscount('t1', 'disc1', {
          status: DiscountStatus.APPROVED,
        } as any, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should approve a pending discount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'disc1',
        status: DiscountStatus.PENDING,
        unit: { unitNumber: 'A-101' },
      });
      mockPrisma.discount.update.mockResolvedValue({
        id: 'disc1',
        status: DiscountStatus.APPROVED,
        unit: { unitNumber: 'A-101' },
      });

      const result = await service.approveDiscount('t1', 'disc1', {
        status: DiscountStatus.APPROVED,
      } as any, 'user1');

      expect(result.status).toBe(DiscountStatus.APPROVED);
    });
  });

  describe('getPriceHistory', () => {
    it('should throw NotFoundException for nonexistent unit', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.getPriceHistory('t1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when no history', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({ id: 'u1' });
      mockPrisma.priceHistory.findMany.mockResolvedValue([]);

      const result = await service.getPriceHistory('t1', 'u1');
      expect(result).toEqual([]);
    });
  });

  describe('listDiscounts', () => {
    it('should filter by unitId when provided', async () => {
      mockPrisma.discount.findMany.mockResolvedValue([]);

      await service.listDiscounts('t1', 'u1');

      expect(mockPrisma.discount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1', unitId: 'u1' },
        }),
      );
    });

    it('should list all discounts when no unitId', async () => {
      mockPrisma.discount.findMany.mockResolvedValue([]);

      await service.listDiscounts('t1');

      expect(mockPrisma.discount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1' },
        }),
      );
    });
  });
});
