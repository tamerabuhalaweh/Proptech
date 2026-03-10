// ============================================================
// Notification Events Service — Auto-create notifications on events
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

export interface NotificationEvent {
  tenantId: string;
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationEventsService {
  private readonly logger = new Logger(NotificationEventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification for a specific user
   */
  async notify(event: NotificationEvent) {
    try {
      await this.prisma.notification.create({
        data: {
          tenantId: event.tenantId,
          userId: event.userId,
          type: event.type || 'INFO',
          title: event.title,
          message: event.message,
          link: event.link || null,
          metadata: (event.metadata || {}) as Prisma.InputJsonValue,
        },
      });
      this.logger.log(`Notification sent to ${event.userId}: ${event.title}`);
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error}`);
    }
  }

  /**
   * Notify on booking created
   */
  async onBookingCreated(tenantId: string, userId: string, bookingId: string, unitNumber: string) {
    await this.notify({
      tenantId,
      userId,
      type: 'SUCCESS',
      title: 'New Booking Created',
      message: `A new booking has been created for unit ${unitNumber}`,
      link: `/bookings/${bookingId}`,
      metadata: { bookingId },
    });
  }

  /**
   * Notify on lead assigned
   */
  async onLeadAssigned(tenantId: string, userId: string, leadId: string, leadName: string) {
    await this.notify({
      tenantId,
      userId,
      type: 'INFO',
      title: 'Lead Assigned',
      message: `Lead "${leadName}" has been assigned to you`,
      link: `/leads/${leadId}`,
      metadata: { leadId },
    });
  }

  /**
   * Notify on document uploaded
   */
  async onDocumentUploaded(tenantId: string, userId: string, documentId: string, docName: string) {
    await this.notify({
      tenantId,
      userId,
      type: 'INFO',
      title: 'Document Uploaded',
      message: `Document "${docName}" has been uploaded`,
      link: `/documents/${documentId}`,
      metadata: { documentId },
    });
  }
}
