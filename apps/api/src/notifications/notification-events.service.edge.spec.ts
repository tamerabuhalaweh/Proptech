// ============================================================
// Notification Events Service — Cross-Module Interaction Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsService } from './notification-events.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  notification: {
    create: jest.fn(),
  },
};

describe('NotificationEventsService (Cross-Module)', () => {
  let service: NotificationEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationEventsService>(NotificationEventsService);
    jest.clearAllMocks();
  });

  describe('onBookingCreated', () => {
    it('should create notification with correct data', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onBookingCreated('t1', 'user1', 'b1', 'A-101');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 't1',
          userId: 'user1',
          type: 'SUCCESS',
          title: 'New Booking Created',
          link: '/bookings/b1',
          metadata: expect.objectContaining({ bookingId: 'b1' }),
        }),
      });
    });

    it('should not throw when DB error occurs', async () => {
      mockPrisma.notification.create.mockRejectedValue(new Error('DB error'));

      // Should not throw — error is caught and logged
      await expect(
        service.onBookingCreated('t1', 'user1', 'b1', 'A-101'),
      ).resolves.not.toThrow();
    });
  });

  describe('onLeadAssigned', () => {
    it('should create notification with lead info', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onLeadAssigned('t1', 'user1', 'lead1', 'Ahmed');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 't1',
          userId: 'user1',
          type: 'INFO',
          title: 'Lead Assigned',
          link: '/leads/lead1',
        }),
      });
    });
  });

  describe('onDocumentUploaded', () => {
    it('should create notification with document info', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onDocumentUploaded('t1', 'user1', 'doc1', 'Contract.pdf');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 't1',
          userId: 'user1',
          type: 'INFO',
          title: 'Document Uploaded',
          link: '/documents/doc1',
        }),
      });
    });
  });

  describe('notify', () => {
    it('should use default type INFO when not specified', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.notify({
        tenantId: 't1',
        userId: 'user1',
        title: 'Test',
        message: 'Test message',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'INFO',
        }),
      });
    });

    it('should handle optional fields', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.notify({
        tenantId: 't1',
        userId: 'user1',
        title: 'Minimal',
        message: 'Minimal message',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          link: null,
          metadata: {},
        }),
      });
    });
  });
});
