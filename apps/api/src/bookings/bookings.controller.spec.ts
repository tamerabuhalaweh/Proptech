// ============================================================
// Bookings Controller — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BookingStatus } from '@prisma/client';

const mockBookingsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  confirm: jest.fn(),
  cancel: jest.fn(),
  complete: jest.fn(),
  checkExpiry: jest.fn(),
};

const mockUser = {
  sub: 'user1',
  email: 'test@test.com',
  role: 'TENANT_ADMIN',
  tenantId: 't1',
};

describe('BookingsController', () => {
  let controller: BookingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingsService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingsController>(BookingsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call bookingsService.create with correct args', async () => {
      const dto = { unitId: 'u1', totalPrice: 500000 };
      const expected = { id: 'b1', ...dto, status: BookingStatus.PENDING };
      mockBookingsService.create.mockResolvedValue(expected);

      const result = await controller.create(mockUser as any, dto);

      expect(mockBookingsService.create).toHaveBeenCalledWith('t1', dto, 'user1');
      expect(result.id).toBe('b1');
    });
  });

  describe('findAll', () => {
    it('should return paginated bookings', async () => {
      const expected = {
        data: [{ id: 'b1' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockBookingsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser as any, { page: 1, limit: 20 });

      expect(mockBookingsService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
    });

    it('should pass filters through to service', async () => {
      mockBookingsService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

      await controller.findAll(mockUser as any, {
        status: BookingStatus.PENDING,
        unitId: 'u1',
        page: 2,
        limit: 10,
      });

      expect(mockBookingsService.findAll).toHaveBeenCalledWith('t1', {
        status: BookingStatus.PENDING,
        unitId: 'u1',
        page: 2,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const expected = { id: 'b1', tenantId: 't1' };
      mockBookingsService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(mockUser as any, 'b1');

      expect(mockBookingsService.findOne).toHaveBeenCalledWith('t1', 'b1');
      expect(result.id).toBe('b1');
    });
  });

  describe('confirm', () => {
    it('should confirm a booking', async () => {
      const expected = { id: 'b1', status: BookingStatus.CONFIRMED };
      mockBookingsService.confirm.mockResolvedValue(expected);

      const result = await controller.confirm(mockUser as any, 'b1');

      expect(mockBookingsService.confirm).toHaveBeenCalledWith('t1', 'b1', 'user1');
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking with reason', async () => {
      const expected = { id: 'b1', status: BookingStatus.CANCELLED };
      mockBookingsService.cancel.mockResolvedValue(expected);

      const result = await controller.cancel(mockUser as any, 'b1', { reason: 'Client changed mind' });

      expect(mockBookingsService.cancel).toHaveBeenCalledWith('t1', 'b1', { reason: 'Client changed mind' }, 'user1');
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('complete', () => {
    it('should complete a booking', async () => {
      const expected = { id: 'b1', status: BookingStatus.COMPLETED };
      mockBookingsService.complete.mockResolvedValue(expected);

      const result = await controller.complete(mockUser as any, 'b1');

      expect(mockBookingsService.complete).toHaveBeenCalledWith('t1', 'b1', 'user1');
      expect(result.status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe('checkExpiry', () => {
    it('should process expired bookings', async () => {
      const expected = { processed: 3, expired: 2, message: '2 booking(s) expired' };
      mockBookingsService.checkExpiry.mockResolvedValue(expected);

      const result = await controller.checkExpiry(mockUser as any, { expiryDays: 14 });

      expect(mockBookingsService.checkExpiry).toHaveBeenCalledWith('t1', { expiryDays: 14 }, 'user1');
      expect(result.expired).toBe(2);
    });
  });
});
