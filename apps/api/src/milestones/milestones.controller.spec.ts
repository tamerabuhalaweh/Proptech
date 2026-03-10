// ============================================================
// Milestones Controller — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MilestoneStatus } from '@prisma/client';

const mockMilestonesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByBooking: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  pay: jest.fn(),
  findOverdue: jest.fn(),
  remove: jest.fn(),
};

const mockUser = {
  sub: 'user1',
  email: 'test@test.com',
  role: 'TENANT_ADMIN',
  tenantId: 't1',
};

describe('MilestonesController', () => {
  let controller: MilestonesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilestonesController],
      providers: [
        { provide: MilestonesService, useValue: mockMilestonesService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MilestonesController>(MilestonesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a milestone', async () => {
      const dto = { bookingId: 'b1', name: 'Down Payment', amount: 50000, dueDate: '2026-04-01' };
      const expected = { id: 'm1', ...dto, status: MilestoneStatus.UPCOMING };
      mockMilestonesService.create.mockResolvedValue(expected);

      const result = await controller.create(mockUser as any, dto);

      expect(mockMilestonesService.create).toHaveBeenCalledWith('t1', dto, 'user1');
      expect(result.id).toBe('m1');
    });
  });

  describe('findAll', () => {
    it('should return paginated milestones', async () => {
      const expected = {
        data: [{ id: 'm1' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockMilestonesService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser as any, {});

      expect(mockMilestonesService.findAll).toHaveBeenCalledWith('t1', {});
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByBooking', () => {
    it('should return milestones for a booking', async () => {
      const expected = [{ id: 'm1', bookingId: 'b1' }];
      mockMilestonesService.findByBooking.mockResolvedValue(expected);

      const result = await controller.findByBooking(mockUser as any, 'b1');

      expect(mockMilestonesService.findByBooking).toHaveBeenCalledWith('t1', 'b1');
      expect(result).toHaveLength(1);
    });
  });

  describe('pay', () => {
    it('should mark a milestone as paid', async () => {
      const dto = { paymentMethod: 'BANK_TRANSFER', receiptNumber: 'REC-001' };
      const expected = { id: 'm1', status: MilestoneStatus.PAID };
      mockMilestonesService.pay.mockResolvedValue(expected);

      const result = await controller.pay(mockUser as any, 'm1', dto);

      expect(mockMilestonesService.pay).toHaveBeenCalledWith('t1', 'm1', dto, 'user1');
      expect(result.status).toBe(MilestoneStatus.PAID);
    });
  });

  describe('findOverdue', () => {
    it('should return overdue milestones', async () => {
      const expected = [{ id: 'm1', status: MilestoneStatus.OVERDUE }];
      mockMilestonesService.findOverdue.mockResolvedValue(expected);

      const result = await controller.findOverdue(mockUser as any);

      expect(mockMilestonesService.findOverdue).toHaveBeenCalledWith('t1');
      expect(result[0].status).toBe(MilestoneStatus.OVERDUE);
    });
  });

  describe('remove', () => {
    it('should delete a milestone', async () => {
      mockMilestonesService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(mockUser as any, 'm1');

      expect(mockMilestonesService.remove).toHaveBeenCalledWith('t1', 'm1', 'user1');
      expect(result.deleted).toBe(true);
    });
  });
});
