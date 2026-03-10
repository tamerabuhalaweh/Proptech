// ============================================================
// Milestones Service — Edge Case Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MilestoneStatus } from '@prisma/client';
import { MilestonesService } from './milestones.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  booking: { findFirst: jest.fn() },
  milestone: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('MilestonesService (Edge Cases)', () => {
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

  describe('create', () => {
    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.create('t1', {
          bookingId: 'nonexistent',
          name: 'Test',
          amount: 50000,
          dueDate: '2026-04-01',
        }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBooking', () => {
    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.findByBooking('t1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when no milestones exist', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', tenantId: 't1' });
      mockPrisma.milestone.findMany.mockResolvedValue([]);

      const result = await service.findByBooking('t1', 'b1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for invalid id', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('t1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('pay', () => {
    it('should reject paying an already paid milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({
        id: 'm1',
        tenantId: 't1',
        status: MilestoneStatus.PAID,
      });

      await expect(
        service.pay('t1', 'm1', { paymentMethod: 'BANK_TRANSFER' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject paying a cancelled milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({
        id: 'm1',
        tenantId: 't1',
        status: MilestoneStatus.CANCELLED,
      });

      await expect(
        service.pay('t1', 'm1', { paymentMethod: 'CASH' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow paying an overdue milestone', async () => {
      const milestone = {
        id: 'm1',
        tenantId: 't1',
        name: 'Overdue Payment',
        status: MilestoneStatus.OVERDUE,
        amount: 50000,
      };
      mockPrisma.milestone.findFirst.mockResolvedValue(milestone);
      mockPrisma.milestone.update.mockResolvedValue({
        ...milestone,
        status: MilestoneStatus.PAID,
      });

      const result = await service.pay('t1', 'm1', { paymentMethod: 'CASH' }, 'user1');

      expect(result.status).toBe(MilestoneStatus.PAID);
      expect(mockPrisma.milestone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: MilestoneStatus.PAID,
            paymentMethod: 'CASH',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException for nonexistent milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue(null);

      await expect(
        service.update('t1', 'nonexistent', { name: 'Updated' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({ id: 'm1', tenantId: 't1' });
      mockPrisma.milestone.update.mockResolvedValue({ id: 'm1', name: 'Updated Name' });

      await service.update('t1', 'm1', { name: 'Updated Name' }, 'user1');

      expect(mockPrisma.milestone.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { name: 'Updated Name' },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for nonexistent milestone', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('t1', 'nonexistent', 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete milestone and log activity', async () => {
      mockPrisma.milestone.findFirst.mockResolvedValue({ id: 'm1', tenantId: 't1' });
      mockPrisma.milestone.delete.mockResolvedValue({ id: 'm1' });

      const result = await service.remove('t1', 'm1', 'user1');

      expect(result.deleted).toBe(true);
      expect(mockPrisma.milestone.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
    });
  });

  describe('findOverdue', () => {
    it('should auto-update overdue status and return results', async () => {
      mockPrisma.milestone.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.milestone.findMany.mockResolvedValue([
        { id: 'm1', status: MilestoneStatus.OVERDUE },
        { id: 'm2', status: MilestoneStatus.OVERDUE },
      ]);

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
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should handle default pagination', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.milestone.count.mockResolvedValue(0);

      const result = await service.findAll('t1', {});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should filter by booking and status', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([]);
      mockPrisma.milestone.count.mockResolvedValue(0);

      await service.findAll('t1', {
        bookingId: 'b1',
        status: MilestoneStatus.PAID,
        page: 2,
        limit: 10,
      });

      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenantId: 't1',
            bookingId: 'b1',
            status: MilestoneStatus.PAID,
          },
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});
