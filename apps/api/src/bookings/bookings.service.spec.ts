// ============================================================
// Bookings Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BookingStatus, UnitStatus } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockTx = {
  booking: {
    create: jest.fn(),
    update: jest.fn(),
  },
  unit: {
    update: jest.fn(),
  },
};

const mockPrisma = {
  unit: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  lead: {
    findFirst: jest.fn(),
  },
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

describe('BookingsService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a booking and set unit to RESERVED', async () => {
      const unit = { id: 'u1', tenantId: 't1', status: UnitStatus.AVAILABLE, unitNumber: 'A-101' };
      mockPrisma.unit.findFirst.mockResolvedValue(unit);
      mockPrisma.booking.findFirst.mockResolvedValue(null); // no active booking

      const created = {
        id: 'b1',
        tenantId: 't1',
        unitId: 'u1',
        status: BookingStatus.PENDING,
        totalPrice: 750000,
        unit: { id: 'u1', unitNumber: 'A-101', buildingId: 'bld1' },
        lead: null,
      };
      mockTx.booking.create.mockResolvedValue(created);
      mockTx.unit.update.mockResolvedValue({});

      const result = await service.create('t1', { unitId: 'u1', totalPrice: 750000 }, 'user1');

      expect(result.id).toBe('b1');
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(mockTx.unit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: { status: UnitStatus.RESERVED },
        }),
      );
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'booking', action: 'created' }),
      );
    });

    it('should reject if unit is not AVAILABLE', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        tenantId: 't1',
        status: UnitStatus.RESERVED,
      });

      await expect(
        service.create('t1', { unitId: 'u1', totalPrice: 500000 }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if unit already has an active booking', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue({
        id: 'u1',
        tenantId: 't1',
        status: UnitStatus.AVAILABLE,
      });
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'existing',
        status: BookingStatus.PENDING,
      });

      await expect(
        service.create('t1', { unitId: 'u1', totalPrice: 500000 }, 'user1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject if unit not found', async () => {
      mockPrisma.unit.findFirst.mockResolvedValue(null);

      await expect(
        service.create('t1', { unitId: 'nonexistent', totalPrice: 500000 }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated bookings', async () => {
      const bookings = [{ id: 'b1' }, { id: 'b2' }];
      mockPrisma.booking.findMany.mockResolvedValue(bookings);
      mockPrisma.booking.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      await service.findAll('t1', { status: BookingStatus.PENDING });

      const where = mockPrisma.booking.findMany.mock.calls[0][0].where;
      expect(where.status).toBe(BookingStatus.PENDING);
    });
  });

  describe('findOne', () => {
    it('should return booking by id', async () => {
      const booking = { id: 'b1', tenantId: 't1', status: BookingStatus.PENDING };
      mockPrisma.booking.findFirst.mockResolvedValue(booking);

      const result = await service.findOne('t1', 'b1');
      expect(result.id).toBe('b1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('should confirm a pending booking and set unit to SOLD', async () => {
      const booking = {
        id: 'b1',
        tenantId: 't1',
        unitId: 'u1',
        status: BookingStatus.PENDING,
        unit: { id: 'u1', unitNumber: 'A-101' },
      };
      mockPrisma.booking.findFirst.mockResolvedValue(booking);
      mockTx.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.CONFIRMED,
        unit: { id: 'u1', unitNumber: 'A-101' },
        lead: null,
      });
      mockTx.unit.update.mockResolvedValue({});

      const result = await service.confirm('t1', 'b1', 'user1');

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(mockTx.unit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: UnitStatus.SOLD },
        }),
      );
    });

    it('should reject confirming non-PENDING booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.CONFIRMED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(service.confirm('t1', 'b1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel booking and release unit', async () => {
      const booking = {
        id: 'b1',
        tenantId: 't1',
        unitId: 'u1',
        status: BookingStatus.PENDING,
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

      const result = await service.cancel('t1', 'b1', { reason: 'Client changed mind' }, 'user1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(mockTx.unit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: UnitStatus.AVAILABLE },
        }),
      );
    });

    it('should reject cancelling already cancelled booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.CANCELLED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(
        service.cancel('t1', 'b1', { reason: 'test' }, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete a confirmed booking', async () => {
      const booking = {
        id: 'b1',
        tenantId: 't1',
        unitId: 'u1',
        status: BookingStatus.CONFIRMED,
        unit: { id: 'u1', unitNumber: 'A-101' },
      };
      mockPrisma.booking.findFirst.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({
        ...booking,
        status: BookingStatus.COMPLETED,
        unit: { id: 'u1', unitNumber: 'A-101' },
        lead: null,
      });

      const result = await service.complete('t1', 'b1', 'user1');
      expect(result.status).toBe(BookingStatus.COMPLETED);
    });

    it('should reject completing non-CONFIRMED booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'b1',
        tenantId: 't1',
        status: BookingStatus.PENDING,
        unit: { id: 'u1', unitNumber: 'A-101' },
      });

      await expect(service.complete('t1', 'b1', 'user1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkExpiry', () => {
    it('should expire pending bookings past cutoff', async () => {
      const expiredBookings = [
        { id: 'b1', unitId: 'u1', unit: { id: 'u1', unitNumber: 'A-101' } },
        { id: 'b2', unitId: 'u2', unit: { id: 'u2', unitNumber: 'A-102' } },
      ];
      mockPrisma.booking.findMany.mockResolvedValue(expiredBookings);
      mockTx.booking.update.mockResolvedValue({});
      mockTx.unit.update.mockResolvedValue({});

      const result = await service.checkExpiry('t1', { expiryDays: 14 }, 'user1');

      expect(result.expired).toBe(2);
      expect(result.processed).toBe(2);
    });

    it('should return zero when no bookings to expire', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await service.checkExpiry('t1', {}, 'user1');

      expect(result.expired).toBe(0);
    });
  });
});
