// ============================================================
// Notifications Controller — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../auth/guards/roles.guard';

const mockNotificationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  markAsRead: jest.fn(),
  markAllRead: jest.fn(),
  getUnreadCount: jest.fn(),
  remove: jest.fn(),
};

const mockUser = {
  sub: 'user1',
  email: 'test@test.com',
  role: 'TENANT_ADMIN',
  tenantId: 't1',
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated notifications for user', async () => {
      const expected = {
        data: [{ id: 'n1', title: 'Test' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockNotificationsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser as any, {});

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith('t1', 'user1', {});
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue({ count: 5 });

      const result = await controller.getUnreadCount(mockUser as any);

      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith('t1', 'user1');
      expect(result.count).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const expected = { id: 'n1', isRead: true };
      mockNotificationsService.markAsRead.mockResolvedValue(expected);

      const result = await controller.markAsRead(mockUser as any, 'n1');

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('t1', 'user1', 'n1');
      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllRead.mockResolvedValue({ updated: 5 });

      const result = await controller.markAllRead(mockUser as any);

      expect(mockNotificationsService.markAllRead).toHaveBeenCalledWith('t1', 'user1');
      expect(result.updated).toBe(5);
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      mockNotificationsService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(mockUser as any, 'n1');

      expect(mockNotificationsService.remove).toHaveBeenCalledWith('t1', 'user1', 'n1');
      expect(result.deleted).toBe(true);
    });
  });
});
