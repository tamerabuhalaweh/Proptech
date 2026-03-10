import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UnitStatus } from '@prisma/client';
import { UnitsService } from './units.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  building: {
    findFirst: jest.fn(),
  },
  unit: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  priceHistory: {
    create: jest.fn(),
  },
};

const mockActivity = {
  log: jest.fn(),
};

describe('UnitsService', () => {
  let service: UnitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a unit and log activity', async () => {
      mockPrisma.building.findFirst.mockResolvedValue({ id: 'b1', tenantId: 't1' });
      const created = {
        id: 'u1',
        unitNumber: 'A-101',
        tenantId: 't1',
        buildingId: 'b1',
        building: { name: 'Tower A', propertyId: 'p1' },
      };
      mockPrisma.unit.create.mockResolvedValue(created);

      const result = await service.create('t1', 'b1', {
        unitNumber: 'A-101',
        floor: 1,
        area: 85.5,
      }, 'user1');

      expect(result.id).toBe('u1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'unit', action: 'created' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated units', async () => {
      mockPrisma.unit.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      mockPrisma.unit.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('status transitions', () => {
    it('should allow AVAILABLE → RESERVED', async () => {
      const existing = {
        id: 'u1',
        tenantId: 't1',
        unitNumber: 'A-101',
        status: UnitStatus.AVAILABLE,
        basePrice: 500000,
        building: { id: 'b1', name: 'Tower A', propertyId: 'p1' },
        discounts: [],
        priceHistory: [],
      };
      mockPrisma.unit.findFirst.mockResolvedValue(existing);
      mockPrisma.unit.update.mockResolvedValue({
        ...existing,
        status: UnitStatus.RESERVED,
      });

      const result = await service.update('t1', 'u1', { status: UnitStatus.RESERVED }, 'user1');
      expect(result.status).toBe(UnitStatus.RESERVED);
    });

    it('should reject SOLD → AVAILABLE (invalid transition)', async () => {
      const existing = {
        id: 'u1',
        tenantId: 't1',
        unitNumber: 'A-101',
        status: UnitStatus.SOLD,
        basePrice: 500000,
        building: { id: 'b1', name: 'Tower A', propertyId: 'p1' },
        discounts: [],
        priceHistory: [],
      };
      mockPrisma.unit.findFirst.mockResolvedValue(existing);

      await expect(
        service.update('t1', 'u1', { status: UnitStatus.AVAILABLE }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow RESERVED → SOLD', async () => {
      const existing = {
        id: 'u1',
        tenantId: 't1',
        unitNumber: 'A-101',
        status: UnitStatus.RESERVED,
        basePrice: 500000,
        building: { id: 'b1', name: 'Tower A', propertyId: 'p1' },
        discounts: [],
        priceHistory: [],
      };
      mockPrisma.unit.findFirst.mockResolvedValue(existing);
      mockPrisma.unit.update.mockResolvedValue({
        ...existing,
        status: UnitStatus.SOLD,
      });

      const result = await service.update('t1', 'u1', { status: UnitStatus.SOLD }, 'user1');
      expect(result.status).toBe(UnitStatus.SOLD);
    });
  });

  describe('remove', () => {
    it('should delete available unit', async () => {
      const existing = {
        id: 'u1',
        tenantId: 't1',
        unitNumber: 'A-101',
        status: UnitStatus.AVAILABLE,
        building: { id: 'b1', name: 'Tower A', propertyId: 'p1' },
        discounts: [],
        priceHistory: [],
      };
      mockPrisma.unit.findFirst.mockResolvedValue(existing);
      mockPrisma.unit.delete.mockResolvedValue({});

      const result = await service.remove('t1', 'u1', 'user1');
      expect(result).toHaveProperty('message');
    });

    it('should prevent deletion of sold unit', async () => {
      const existing = {
        id: 'u1',
        tenantId: 't1',
        unitNumber: 'A-101',
        status: UnitStatus.SOLD,
        building: { id: 'b1', name: 'Tower A', propertyId: 'p1' },
        discounts: [],
        priceHistory: [],
      };
      mockPrisma.unit.findFirst.mockResolvedValue(existing);

      await expect(service.remove('t1', 'u1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create units', async () => {
      mockPrisma.building.findFirst.mockResolvedValue({ id: 'b1', tenantId: 't1' });
      mockPrisma.unit.create.mockResolvedValue({});

      const result = await service.bulkCreate('t1', {
        buildingId: 'b1',
        units: [
          { unitNumber: 'A-101', floor: 1, area: 85 },
          { unitNumber: 'A-102', floor: 1, area: 90 },
        ],
      }, 'user1');

      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(0);
    });
  });
});
