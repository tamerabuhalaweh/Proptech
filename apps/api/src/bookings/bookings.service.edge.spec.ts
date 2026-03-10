// ============================================================
// Bookings Service — Additional Edge Case Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus, UnitStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockTx = {
  booking: { create: jest.fn(), update: jest.fn() },
  unit: { update: jest.fn() },
};

const mockPrisma = {
  unit: { findFirst: jest.fn(), update: jest.fn() },
  lead: { findFirst: jest.fn() },
  booking: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(mockTx)),
};

const mockActivity = { log: jest.fn() };

describe('BookingsService (Edge Cases)', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockTx));
  });

  describe('create with leadId', () => {
    it('should reject if lead not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1', tenantId: 't1', status: UnitStatus.AVAILABLE,
      });
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      mockPrisma.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.create('t1', {
          unitId: 'u1',
          totalPrice: 500000,
          leadId: 'nonexistent',
        }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should accept valid lead and include in booking', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1', tenantId: 't1', status: UnitStatus.AVAILABLE,
      });
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      mockPrisma.lead.findFirst.mockResolvedValue({
        id: 'l1', tenantId: 't1', name: 'Ahmed', deletedAt: null,
      });
      mockTx.booking.create.mockResolvedValue({
        id: 'b1', unitId: 'u1', leadId: 'l1',
        unit: { id: 'u1', unitNumber: 'A-101', buildingId: 'bld1' },
        lead: { id: 'l1', name: 'Ahmed' },
        totalPrice: 500000,
      });
      mockTx.unit.update.mockResolvedValue({});

      const result = await service.create('t1', {
        unitId: 'u1',
        totalPrice: 500000,
        leadId: 'l1',
      }, 'user1');

      expect(result.leadId).toBe('l1');
    });
  });

  describe('cancel - expired booking', () => {
    it('should reject cancelling an expired booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.EXPIRED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(
        service.cancel('t1', 'b1', { reason: 'test' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel - confirmed booking', () => {
    it('should allow cancelling a confirmed booking', async () => {
      const booking = {
        id: 'b1',
        tenantId: 't1',
        unitId: 'u1',
        status: BookingStatus.CONFIRMED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      };
      mockPrisma.booking.findFirst.mockResolvedValue(booking);
      mockTx.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CANCELLED,
        unit: { id: 'u1', unitNumber: 'A-101' },
        lead: null,
      });
      mockTx.unit.update.mockResolvedValue({});

      const result = await service.cancel('t1', 'b1', { reason: 'Changed mind' }, 'user1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('findAll with date filters', () => {
    it('should apply date range filters', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      await service.findAll('t1', {
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });

      const where = mockPrisma.booking.findMany.mock.calls[0][0].where;
      expect(where.reservationDate).toBeDefined();
      expect(where.reservationDate.gte).toEqual(new Date('2026-01-01'));
      expect(where.reservationDate.lte).toEqual(new Date('2026-12-31'));
    });

    it('should filter by propertyId via nested unit.building', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      await service.findAll('t1', { propertyId: 'p1' });

      const where = mockPrisma.booking.findMany.mock.calls[0][0].where;
      expect(where.unit).toBeDefined();
      expect(where.unit.building.propertyId).toBe('p1');
    });

    it('should handle empty filters gracefully', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      const result = await service.findAll('t1', {});

      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('complete - edge cases', () => {
    it('should reject completing a PENDING booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.PENDING,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(
        service.complete('t1', 'b1', 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject completing a CANCELLED booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.CANCELLED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(
        service.complete('t1', 'b1', 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkExpiry - default days', () => {
    it('should use default 14 days when expiryDays not specified', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await service.checkExpiry('t1', {}, 'user1');

      expect(result.expired).toBe(0);
      expect(result.processed).toBe(0);
    });
  });
});
