import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  property: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
};

const mockActivity = {
  log: jest.fn(),
};

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property and log activity', async () => {
      const dto = { name: 'Test Property', city: 'Riyadh' };
      const created = { id: 'prop1', ...dto, tenantId: 't1', _count: { buildings: 0 } };
      mockPrisma.property.create.mockResolvedValue(created);

      const result = await service.create('t1', dto, 'user1');

      expect(result.id).toBe('prop1');
      expect(mockPrisma.property.create).toHaveBeenCalled();
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 't1',
          entityType: 'property',
          action: 'created',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const properties = [
        { id: 'p1', name: 'Prop 1' },
        { id: 'p2', name: 'Prop 2' },
      ];
      mockPrisma.property.findMany.mockResolvedValue(properties);
      mockPrisma.property.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should apply filters', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await service.findAll('t1', { type: 'RESIDENTIAL' as any, city: 'Riyadh' });

      const where = mockPrisma.property.findMany.mock.calls[0][0].where;
      expect(where.type).toBe('RESIDENTIAL');
      expect(where.city).toEqual({ contains: 'Riyadh', mode: 'insensitive' });
    });
  });

  describe('findOne', () => {
    it('should return property by id', async () => {
      const property = { id: 'p1', tenantId: 't1', name: 'Test', deletedAt: null };
      mockPrisma.property.findFirst.mockResolvedValue(property);

      const result = await service.findOne('t1', 'p1');
      expect(result.id).toBe('p1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.property.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update property and log activity', async () => {
      const existing = { id: 'p1', tenantId: 't1', name: 'Old', deletedAt: null };
      mockPrisma.property.findFirst.mockResolvedValue(existing);
      mockPrisma.property.update.mockResolvedValue({
        ...existing,
        name: 'Updated',
        _count: { buildings: 0 },
      });

      const result = await service.update('t1', 'p1', { name: 'Updated' }, 'user1');
      expect(result.name).toBe('Updated');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'updated' }),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete property and log activity', async () => {
      const existing = { id: 'p1', tenantId: 't1', name: 'Test', deletedAt: null, buildings: [] };
      mockPrisma.property.findFirst.mockResolvedValue(existing);
      mockPrisma.property.update.mockResolvedValue({ ...existing, deletedAt: new Date() });

      const result = await service.remove('t1', 'p1', 'user1');
      expect(result).toHaveProperty('message');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
    });
  });
});
