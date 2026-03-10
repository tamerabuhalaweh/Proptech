// ============================================================
// Notification Events Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsService } from './notification-events.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  notification: {
    create: jest.fn(),
  },
};

describe('NotificationEventsService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notify', () => {
    it('should create a notification', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.notify({
        tenantId: 't1',
        userId: 'user1',
        title: 'Test',
        message: 'Test message',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            userId: 'user1',
            type: 'INFO',
            title: 'Test',
          }),
        }),
      );
    });

    it('should not throw on create failure', async () => {
      mockPrisma.notification.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.notify({
          tenantId: 't1',
          userId: 'user1',
          title: 'Test',
          message: 'Test',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('onBookingCreated', () => {
    it('should create a booking notification', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onBookingCreated('t1', 'user1', 'booking1', 'A-101');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'SUCCESS',
            title: 'New Booking Created',
          }),
        }),
      );
    });
  });

  describe('onLeadAssigned', () => {
    it('should create a lead assignment notification', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onLeadAssigned('t1', 'user1', 'lead1', 'John Doe');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'INFO',
            title: 'Lead Assigned',
          }),
        }),
      );
    });
  });

  describe('onDocumentUploaded', () => {
    it('should create a document upload notification', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.onDocumentUploaded('t1', 'user1', 'doc1', 'Contract.pdf');

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'INFO',
            title: 'Document Uploaded',
          }),
        }),
      );
    });
  });
});
