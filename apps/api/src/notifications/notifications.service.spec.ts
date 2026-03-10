// ============================================================
// Notifications Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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

  describe('create', () => {
    it('should create a notification', async () => {
      const created = { id: 'n1', title: 'Test', type: 'INFO' };
      mockPrisma.notification.create.mockResolvedValue(created);

      const result = await service.create('t1', {
        userId: 'user1',
        title: 'Test',
        message: 'Test message',
      } as any);

      expect(result.id).toBe('n1');
    });

    it('should use default type INFO', async () => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n1' });

      await service.create('t1', {
        userId: 'user1',
        title: 'Test',
        message: 'Msg',
      } as any);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'INFO',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated notifications for user', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.findAll('t1', 'user1', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by type and isRead', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.findAll('t1', 'user1', {
        type: 'WARNING',
        isRead: false,
      } as any);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 't1',
            userId: 'user1',
            type: 'WARNING',
            isRead: false,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return notification by id', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({ id: 'n1' });

      const result = await service.findOne('t1', 'user1', 'n1');
      expect(result.id).toBe('n1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('t1', 'user1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({ id: 'n1' });
      mockPrisma.notification.update.mockResolvedValue({
        id: 'n1',
        isRead: true,
      });

      const result = await service.markAsRead('t1', 'user1', 'n1');
      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        service.markAsRead('t1', 'user1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllRead('t1', 'user1');
      expect(result.updated).toBe(5);
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
    });

    it('should return 0 when no unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('t1', 'user1');
      expect(result.count).toBe(0);
    });
  });

  describe('remove', () => {
    it('should delete notification', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({ id: 'n1' });
      mockPrisma.notification.delete.mockResolvedValue({ id: 'n1' });

      const result = await service.remove('t1', 'user1', 'n1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('t1', 'user1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
