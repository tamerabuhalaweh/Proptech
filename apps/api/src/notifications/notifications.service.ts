// ============================================================
// Notifications Service — In-app notification management
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, QueryNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification
   */
  async create(tenantId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        tenantId,
        userId: dto.userId,
        type: dto.type || 'INFO',
        title: dto.title,
        message: dto.message,
        link: dto.link || null,
        metadata: (dto.metadata || {}) as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Notification created: ${notification.id} for user ${dto.userId}`);
    return notification;
  }

  /**
   * List notifications for the current user
   */
  async findAll(tenantId: string, userId: string, query: QueryNotificationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      tenantId,
      userId,
      ...(query.type && { type: query.type }),
      ...(query.isRead !== undefined && { isRead: query.isRead }),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single notification
   */
  async findOne(tenantId: string, userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, tenantId, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    return notification;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(tenantId: string, userId: string, id: string) {
    await this.findOne(tenantId, userId, id);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all unread notifications as read for the user
   */
  async markAllRead(tenantId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
    return { updated: result.count };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(tenantId: string, userId: string) {
    const count = await this.prisma.notification.count({
      where: { tenantId, userId, isRead: false },
    });

    return { count };
  }

  /**
   * Delete a notification
   */
  async remove(tenantId: string, userId: string, id: string) {
    await this.findOne(tenantId, userId, id);

    await this.prisma.notification.delete({ where: { id } });

    this.logger.log(`Notification deleted: ${id}`);
    return { deleted: true };
  }
}
