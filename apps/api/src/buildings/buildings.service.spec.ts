import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  property: {
    findFirst: jest.fn(),
  },
  building: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  unit: {
    count: jest.fn(),
  },
};

const mockActivity = {
  log: jest.fn(),
};

describe('BuildingsService', () => {
  let service: BuildingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<BuildingsService>(BuildingsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a building and log activity', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1', tenantId: 't1' });
      const created = { id: 'b1', name: 'Tower A', tenantId: 't1', propertyId: 'prop1', _count: { units: 0 } };
      mockPrisma.building.create.mockResolvedValue(created);

      const result = await service.create('t1', 'prop1', { name: 'Tower A' }, 'user1');

      expect(result.id).toBe('b1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'building', action: 'created' }),
      );
    });

    it('should throw NotFoundException if property not found', async () => {
      mockPrisma.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create('t1', 'nonexistent', { name: 'Tower A' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return buildings for a property', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1' });
      const buildings = [
        { id: 'b1', name: 'Tower A' },
        { id: 'b2', name: 'Tower B' },
      ];
      mockPrisma.building.findMany.mockResolvedValue(buildings);

      const result = await service.findAll('t1', 'prop1');
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return building by id', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1' });
      const building = { id: 'b1', name: 'Tower A', tenantId: 't1', propertyId: 'prop1' };
      mockPrisma.building.findFirst.mockResolvedValue(building);

      const result = await service.findOne('t1', 'prop1', 'b1');
      expect(result.id).toBe('b1');
    });

    it('should throw NotFoundException if building not found', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1' });
      mockPrisma.building.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'prop1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete building with no units', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1' });
      mockPrisma.building.findFirst.mockResolvedValue({ id: 'b1', name: 'Tower A', tenantId: 't1', propertyId: 'prop1' });
      mockPrisma.unit.count.mockResolvedValue(0);
      mockPrisma.building.delete.mockResolvedValue({});

      const result = await service.remove('t1', 'prop1', 'b1', 'user1');
      expect(result).toHaveProperty('message');
    });

    it('should prevent deletion if building has units', async () => {
      mockPrisma.property.findFirst.mockResolvedValue({ id: 'prop1' });
      mockPrisma.building.findFirst.mockResolvedValue({ id: 'b1', name: 'Tower A', tenantId: 't1', propertyId: 'prop1' });
      mockPrisma.unit.count.mockResolvedValue(5);

      await expect(service.remove('t1', 'prop1', 'b1', 'user1')).rejects.toThrow(NotFoundException);
    });
  });
});
