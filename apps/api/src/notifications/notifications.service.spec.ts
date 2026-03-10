// ============================================================
// Notifications Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const created = {
        id: 'notif1',
        tenantId: 't1',
        userId: 'user1',
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message',
      };
      mockPrisma.notification.create.mockResolvedValue(created);

      const result = await service.create('t1', {
        userId: 'user1',
        title: 'Test',
        message: 'Test message',
      });

      expect(result.id).toBe('notif1');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            userId: 'user1',
            type: 'INFO',
          }),
        }),
      );
    });

    it('should create a notification with custom type', async () => {
      const created = {
        id: 'notif2',
        tenantId: 't1',
        userId: 'user1',
        type: NotificationType.WARNING,
        title: 'Warning',
        message: 'Watch out',
      };
      mockPrisma.notification.create.mockResolvedValue(created);

      const result = await service.create('t1', {
        userId: 'user1',
        type: NotificationType.WARNING,
        title: 'Warning',
        message: 'Watch out',
      });

      expect(result.type).toBe(NotificationType.WARNING);
    });
  });

  describe('findAll', () => {
    it('should return paginated notifications for user', async () => {
      const notifs = [{ id: 'n1' }, { id: 'n2' }];
      mockPrisma.notification.findMany.mockResolvedValue(notifs);
      mockPrisma.notification.count.mockResolvedValue(2);

      const result = await service.findAll('t1', 'user1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      const where = mockPrisma.notification.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe('user1');
    });

    it('should filter by read status', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findAll('t1', 'user1', { isRead: false });

      const where = mockPrisma.notification.findMany.mock.calls[0][0].where;
      expect(where.isRead).toBe(false);
    });

    it('should filter by type', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findAll('t1', 'user1', { type: NotificationType.SUCCESS });

      const where = mockPrisma.notification.findMany.mock.calls[0][0].where;
      expect(where.type).toBe(NotificationType.SUCCESS);
    });
  });

  describe('findOne', () => {
    it('should return a notification by ID', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n1',
        tenantId: 't1',
        userId: 'user1',
      });

      const result = await service.findOne('t1', 'user1', 'n1');
      expect(result.id).toBe('n1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'user1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n1',
        tenantId: 't1',
        userId: 'user1',
      });
      mockPrisma.notification.update.mockResolvedValue({
        id: 'n1',
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markAsRead('t1', 'user1', 'n1');
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllRead('t1', 'user1');
      expect(result.updated).toBe(5);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1', userId: 'user1', isRead: false },
        }),
      );
    });

    it('should return 0 when no unread notifications', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllRead('t1', 'user1');
      expect(result.updated).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrisma.notification.count.mockResolvedValue(7);

      const result = await service.getUnreadCount('t1', 'user1');
      expect(result.count).toBe(7);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't1', userId: 'user1', isRead: false },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({
        id: 'n1',
        tenantId: 't1',
        userId: 'user1',
      });
      mockPrisma.notification.delete.mockResolvedValue({ id: 'n1' });

      const result = await service.remove('t1', 'user1', 'n1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'user1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
