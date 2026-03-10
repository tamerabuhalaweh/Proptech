// ============================================================
// Milestones Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MilestoneStatus } from '@prisma/client';
import { MilestonesService } from './milestones.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  milestone: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  booking: {
    findFirst: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('MilestonesService', () => {
  let service: MilestonesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<MilestonesService>(MilestonesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a milestone', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', tenantId: 't1' });
      const created = {
        id: 'ms1',
        tenantId: 't1',
        bookingId: 'b1',
        name: 'Down Payment',
        amount: 50000,
        status: MilestoneStatus.UPCOMING,
      };
      mockPrisma.milestone.create.mockResolvedValue(created);

      const result = await service.create(
        't1',
        {
          bookingId: 'b1',
          name: 'Down Payment',
          amount: 50000,
          dueDate: '2026-04-01T00:00:00Z',
        },
        'user1',
      );

      expect(result.id).toBe('ms1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'milestone', action: 'created' }),
      );
    });

    it('should reject if booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          't1',
          { bookingId: 'nonexistent', name: 'Test', amount: 1000, dueDate: '2026-04-01' },
          'user1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated milestones', async () => {
      const milestones = [{ id: 'ms1' }, { id: 'ms2' }];
      mockPrisma.milestone.findMany.mockResolvedValue(milestones);
      mockPrisma.milestone.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by bookingId', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.milestone.count.mockResolvedValue(0);

      await service.findAll('t1', { bookingId: 'b1' });

      const where = mockPrisma.milestone.findMany.mock.calls[0][0].where;
      expect(where.bookingId).toBe('b1');
    });

    it('should filter by status', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.milestone.count.mockResolvedValue(0);

      await service.findAll('t1', { status: MilestoneStatus.OVERDUE });

      const where = mockPrisma.milestone.findMany.mock.calls[0][0].where;
      expect(where.status).toBe(MilestoneStatus.OVERDUE);
    });
  });

  describe('findByBooking', () => {
    it('should return milestones for a booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', tenantId: 't1' });
      const milestones = [{ id: 'ms1' }, { id: 'ms2' }];
      mockPrisma.milestone.findMany.mockResolvedValue(milestones);

      const result = await service.findByBooking('t1', 'b1');
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException if booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.findByBooking('t1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a milestone by ID', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({ id: 'ms1', tenantId: 't1' });

      const result = await service.findOne('t1', 'ms1');
      expect(result.id).toBe('ms1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({ id: 'ms1', tenantId: 't1' });
      mockPrisma.milestone.update.mockResolvedValue({ id: 'ms1', name: 'Updated' });

      const result = await service.update('t1', 'ms1', { name: 'Updated' }, 'user1');
      expect(result.name).toBe('Updated');
    });
  });

  describe('pay', () => {
    it('should mark a milestone as paid', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({
        id: 'ms1',
        tenantId: 't1',
        name: 'Down Payment',
        amount: 50000,
        status: MilestoneStatus.UPCOMING,
        notes: null,
      });
      mockPrisma.milestone.update.mockResolvedValue({
        id: 'ms1',
        status: MilestoneStatus.PAID,
        paidDate: new Date(),
        paymentMethod: 'BANK_TRANSFER',
      });

      const result = await service.pay(
        't1',
        'ms1',
        { paymentMethod: 'BANK_TRANSFER', receiptNumber: 'RCP-001' },
        'user1',
      );

      expect(result.status).toBe(MilestoneStatus.PAID);
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'paid' }),
      );
    });

    it('should reject paying an already paid milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({
        id: 'ms1',
        tenantId: 't1',
        status: MilestoneStatus.PAID,
      });

      await expect(
        service.pay('t1', 'ms1', { paymentMethod: 'CASH' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject paying a cancelled milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({
        id: 'ms1',
        tenantId: 't1',
        status: MilestoneStatus.CANCELLED,
      });

      await expect(
        service.pay('t1', 'ms1', { paymentMethod: 'CASH' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOverdue', () => {
    it('should auto-update and return overdue milestones', async () => {
      mockPrisma.milestone.updateMany.mockResolvedValue({ count: 2 });
      const overdue = [
        { id: 'ms1', status: MilestoneStatus.OVERDUE },
        { id: 'ms2', status: MilestoneStatus.OVERDUE },
      ];
      mockPrisma.milestone.findMany.mockResolvedValue(overdue);

      const result = await service.findOverdue('t1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.milestone.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 't1',
            status: { in: [MilestoneStatus.UPCOMING, MilestoneStatus.DUE] },
          }),
          data: { status: MilestoneStatus.OVERDUE },
        }),
      );
    });

    it('should return empty array when no overdue milestones', async () => {
      mockPrisma.milestone.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.milestone.findMany.mockResolvedValue([]);

      const result = await service.findOverdue('t1');
      expect(result).toHaveLength(0);
    });
  });

  describe('remove', () => {
    it('should delete a milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({ id: 'ms1', tenantId: 't1' });
      mockPrisma.milestone.delete.mockResolvedValue({ id: 'ms1' });

      const result = await service.remove('t1', 'ms1', 'user1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
