// ============================================================
// Campaigns Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  campaign: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign', async () => {
      const dto = {
        name: 'Summer Sale',
        discountValue: 10,
        startDate: '2026-06-01T00:00:00Z',
        endDate: '2026-08-31T23:59:59Z',
      };
      const created = {
        id: 'c1',
        tenantId: 't1',
        name: dto.name,
        discountType: 'percentage',
        discountValue: 10,
        status: CampaignStatus.DRAFT,
      };
      mockPrisma.campaign.create.mockResolvedValue(created);

      const result = await service.create('t1', dto, 'user1');

      expect(result.name).toBe('Summer Sale');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'campaign', action: 'created' }),
      );
    });

    it('should reject if end date is before start date', async () => {
      await expect(
        service.create(
          't1',
          {
            name: 'Bad Campaign',
            discountValue: 10,
            startDate: '2026-08-31T00:00:00Z',
            endDate: '2026-06-01T00:00:00Z',
          },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject percentage discount > 100', async () => {
      await expect(
        service.create(
          't1',
          {
            name: 'Bad Campaign',
            discountType: 'percentage',
            discountValue: 150,
            startDate: '2026-06-01T00:00:00Z',
            endDate: '2026-08-31T00:00:00Z',
          },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated campaigns', async () => {
      mockPrisma.campaign.findMany.mockResolvedValue([{ id: 'c1' }]);
      mockPrisma.campaign.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return campaign by id', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValue({ id: 'c1', name: 'Test' });

      const result = await service.findOne('t1', 'c1');
      expect(result.id).toBe('c1');
    });

    it('should throw if not found', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValue({ id: 'c1', name: 'Old Name' });
      mockPrisma.campaign.update.mockResolvedValue({ id: 'c1', name: 'New Name' });

      const result = await service.update('t1', 'c1', { name: 'New Name' }, 'user1');

      expect(result.name).toBe('New Name');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'updated' }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a campaign', async () => {
      mockPrisma.campaign.findFirst.mockResolvedValue({ id: 'c1', name: 'Test' });
      mockPrisma.campaign.delete.mockResolvedValue({});

      const result = await service.remove('t1', 'c1', 'user1');
      expect(result).toHaveProperty('message');
    });
  });

  describe('getActiveCampaignDiscount', () => {
    it('should return applicable campaign discount for unit', async () => {
      const now = new Date();
      mockPrisma.campaign.findMany.mockResolvedValue([
        {
          id: 'c1',
          name: 'Summer Sale',
          discountType: 'percentage',
          discountValue: 10,
          unitIds: ['u1'],
          propertyIds: [],
          startDate: new Date(now.getTime() - 86400000),
          endDate: new Date(now.getTime() + 86400000),
        },
      ]);

      const result = await service.getActiveCampaignDiscount('t1', 'u1');

      expect(result).not.toBeNull();
      expect(result!.discountValue).toBe(10);
      expect(result!.campaignName).toBe('Summer Sale');
    });

    it('should return null when no active campaign applies', async () => {
      mockPrisma.campaign.findMany.mockResolvedValue([]);

      const result = await service.getActiveCampaignDiscount('t1', 'u1');
      expect(result).toBeNull();
    });
  });
});
