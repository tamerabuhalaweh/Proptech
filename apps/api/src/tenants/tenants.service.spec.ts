import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  tenant: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  excludeDeleted: jest.fn().mockReturnValue({ deletedAt: null }),
};

describe('TenantsService', () => {
  let service: TenantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Company',
      contactEmail: 'test@company.com',
    };

    it('should create a tenant with auto-generated slug', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: '1',
        ...createDto,
        slug: 'test-company',
        status: 'ACTIVE',
      });

      const result = await service.create(createDto);

      expect(result.slug).toBe('test-company');
      expect(mockPrismaService.tenant.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug exists', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create({ ...createDto, slug: 'existing-slug' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      const tenants = [
        { id: '1', name: 'Tenant 1', slug: 'tenant-1' },
        { id: '2', name: 'Tenant 2', slug: 'tenant-2' },
      ];
      mockPrismaService.tenant.findMany.mockResolvedValue(tenants);
      mockPrismaService.tenant.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return tenant by id', async () => {
      const tenant = { id: '1', name: 'Test', slug: 'test', deletedAt: null };
      mockPrismaService.tenant.findUnique.mockResolvedValue(tenant);

      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant is soft-deleted', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tenant', async () => {
      const existing = { id: '1', name: 'Old', slug: 'old', deletedAt: null };
      mockPrismaService.tenant.findUnique.mockResolvedValue(existing);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existing,
        name: 'Updated',
      });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should soft-delete tenant', async () => {
      const existing = { id: '1', name: 'Test', slug: 'test', deletedAt: null };
      mockPrismaService.tenant.findUnique.mockResolvedValue(existing);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existing,
        deletedAt: new Date(),
        status: 'ARCHIVED',
      });

      const result = await service.remove('1');
      expect(result).toHaveProperty('message');
    });
  });

  describe('changeStatus', () => {
    it('should change tenant status', async () => {
      const existing = { id: '1', name: 'Test', slug: 'test', deletedAt: null, status: 'ACTIVE' };
      mockPrismaService.tenant.findUnique.mockResolvedValue(existing);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existing,
        status: 'SUSPENDED',
      });

      const result = await service.changeStatus('1', { status: 'SUSPENDED' as any });
      expect(result.status).toBe('SUSPENDED');
    });
  });
});
