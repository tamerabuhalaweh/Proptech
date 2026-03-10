import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Reflector } from '@nestjs/core';

const mockTenantsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  changeStatus: jest.fn(),
};

describe('TenantsController', () => {
  let controller: TenantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        { provide: TenantsService, useValue: mockTenantsService },
        Reflector,
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call tenantsService.create', async () => {
      const dto = { name: 'New Tenant', contactEmail: 'test@tenant.com' };
      const expected = { id: '1', ...dto, slug: 'new-tenant' };
      mockTenantsService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);
      expect(mockTenantsService.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should call tenantsService.findAll with pagination', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      mockTenantsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);
      expect(mockTenantsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call tenantsService.findOne for SUPER_ADMIN', async () => {
      const expected = { id: '1', name: 'Test' };
      mockTenantsService.findOne.mockResolvedValue(expected);
      const user = { sub: 'u1', email: 'a@a.com', role: 'SUPER_ADMIN', tenantId: 'other' };

      const result = await controller.findOne(user as any, '1');
      expect(result.id).toBe('1');
    });

    it('should allow TENANT_ADMIN to access their own tenant', async () => {
      const expected = { id: 't1', name: 'Test' };
      mockTenantsService.findOne.mockResolvedValue(expected);
      const user = { sub: 'u1', email: 'a@a.com', role: 'TENANT_ADMIN', tenantId: 't1' };

      const result = await controller.findOne(user as any, 't1');
      expect(result.id).toBe('t1');
    });

    it('should deny TENANT_ADMIN from accessing other tenants', async () => {
      const user = { sub: 'u1', email: 'a@a.com', role: 'TENANT_ADMIN', tenantId: 't1' };

      await expect(controller.findOne(user as any, 't2')).rejects.toThrow('You can only access your own tenant');
    });
  });

  describe('update', () => {
    it('should call tenantsService.update for SUPER_ADMIN', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: '1', name: 'Updated' };
      mockTenantsService.update.mockResolvedValue(expected);
      const user = { sub: 'u1', email: 'a@a.com', role: 'SUPER_ADMIN', tenantId: 'other' };

      const result = await controller.update(user as any, '1', dto);
      expect(result.name).toBe('Updated');
    });

    it('should deny TENANT_ADMIN from updating other tenants', async () => {
      const dto = { name: 'Updated' };
      const user = { sub: 'u1', email: 'a@a.com', role: 'TENANT_ADMIN', tenantId: 't1' };

      await expect(controller.update(user as any, 't2', dto)).rejects.toThrow('You can only access your own tenant');
    });
  });

  describe('remove', () => {
    it('should call tenantsService.remove', async () => {
      mockTenantsService.remove.mockResolvedValue({ message: 'Deleted' });

      const result = await controller.remove('1');
      expect(result).toHaveProperty('message');
    });
  });

  describe('changeStatus', () => {
    it('should call tenantsService.changeStatus', async () => {
      const dto = { status: 'SUSPENDED' as any };
      mockTenantsService.changeStatus.mockResolvedValue({ id: '1', status: 'SUSPENDED' });

      const result = await controller.changeStatus('1', dto);
      expect(result.status).toBe('SUSPENDED');
    });
  });
});
