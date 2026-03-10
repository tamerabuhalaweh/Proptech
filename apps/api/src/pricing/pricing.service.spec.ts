import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DiscountStatus } from '@prisma/client';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  unit: {
    findFirst: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  discount: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  priceHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockActivity = {
  log: jest.fn(),
};

describe('PricingService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePrice', () => {
    it('should calculate price with premiums and discounts', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-501',
        basePrice: 500000,
        floor: 5,
        discounts: [
          { type: 'percentage', value: 5 },
        ],
      });

      const result = await service.calculatePrice('t1', {
        unitId: 'u1',
        floorPremium: 1000,
        viewPremium: 10000,
        featurePremiums: [5000, 3000],
      });

      expect(result.breakdown.basePrice).toBe(500000);
      expect(result.breakdown.floorPremium).toBe(5000); // 1000 * 5 floors
      expect(result.breakdown.viewPremium).toBe(10000);
      expect(result.breakdown.featurePremiums).toBe(8000);
      expect(result.breakdown.grossPrice).toBe(523000);
      // 5% discount on 523000 = 26150
      expect(result.breakdown.totalDiscount).toBe(26150);
      expect(result.breakdown.finalPrice).toBe(496850);
    });

    it('should throw NotFoundException if unit not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.calculatePrice('t1', { unitId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePrice', () => {
    it('should update price and create history record', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 500000,
      });
      mockPrisma.unit.update.mockResolvedValue({
        id: 'u1',
        unitNumber: 'A-101',
        basePrice: 550000,
      });

      const result = await service.updatePrice('t1', {
        unitId: 'u1',
        newPrice: 550000,
        reason: 'Market adjustment',
      }, 'user1');

      expect(result.basePrice).toBe(550000);
      expect(mockPrisma.priceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          oldPrice: 500000,
          newPrice: 550000,
        }),
      });
    });
  });

  describe('createDiscount', () => {
    it('should create a discount request', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({ id: 'u1', unitNumber: 'A-101' });
      mockPrisma.discount.create.mockResolvedValue({
        id: 'd1',
        type: 'percentage',
        value: 10,
        status: 'PENDING',
        unit: { unitNumber: 'A-101' },
      });

      const result = await service.createDiscount('t1', {
        unitId: 'u1',
        type: 'percentage',
        value: 10,
        reason: 'Early bird',
      }, 'user1');

      expect(result.status).toBe('PENDING');
      expect(mockActivity.log).toHaveBeenCalled();
    });

    it('should reject percentage discount > 100', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({ id: 'u1' });

      await expect(
        service.createDiscount('t1', {
          unitId: 'u1',
          type: 'percentage',
          value: 150,
        }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveDiscount', () => {
    it('should approve a pending discount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'd1',
        status: DiscountStatus.PENDING,
        unit: { unitNumber: 'A-101' },
      });
      mockPrisma.discount.update.mockResolvedValue({
        id: 'd1',
        status: DiscountStatus.APPROVED,
        unit: { unitNumber: 'A-101' },
      });

      const result = await service.approveDiscount('t1', 'd1', {
        status: DiscountStatus.APPROVED,
      }, 'admin1');

      expect(result.status).toBe(DiscountStatus.APPROVED);
    });

    it('should reject approval of non-pending discount', async () => {
      mockPrisma.discount.findFirst.mockResolvedValue({
        id: 'd1',
        status: DiscountStatus.APPROVED,
        unit: { unitNumber: 'A-101' },
      });

      await expect(
        service.approveDiscount('t1', 'd1', {
          status: DiscountStatus.REJECTED,
        }, 'admin1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
