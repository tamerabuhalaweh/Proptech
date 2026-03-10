// ============================================================
// Communications Service — Communication log CRUD & filtering
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import {
  CreateCommunicationDto,
  UpdateCommunicationDto,
  QueryCommunicationDto,
} from './dto';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Create a communication record
   */
  async create(tenantId: string, dto: CreateCommunicationDto, userId: string) {
    const communication = await this.prisma.communication.create({
      data: {
        tenantId,
        type: dto.type,
        direction: dto.direction,
        leadId: dto.leadId || null,
        bookingId: dto.bookingId || null,
        subject: dto.subject || null,
        body: dto.body || null,
        from: dto.from || null,
        to: dto.to || null,
        status: dto.status || 'PENDING',
        sentAt: dto.sentAt ? new Date(dto.sentAt) : null,
        metadata: (dto.metadata || {}) as Prisma.InputJsonValue,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'communication',
      entityId: communication.id,
      action: 'created',
      description: `${dto.type} communication logged — ${dto.direction} — ${dto.subject || '(no subject)'}`,
      performedBy: userId,
      metadata: { type: dto.type, direction: dto.direction },
    });

    this.logger.log(`Communication created: ${communication.id}`);
    return communication;
  }

  /**
   * List communications with filters and pagination
   */
  async findAll(tenantId: string, query: QueryCommunicationDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CommunicationWhereInput = {
      tenantId,
      ...(query.type && { type: query.type }),
      ...(query.direction && { direction: query.direction }),
      ...(query.status && { status: query.status }),
      ...(query.leadId && { leadId: query.leadId }),
      ...(query.bookingId && { bookingId: query.bookingId }),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single communication by ID
   */
  async findOne(tenantId: string, id: string) {
    const communication = await this.prisma.communication.findFirst({
      where: { id, tenantId },
    });

    if (!communication) {
      throw new NotFoundException(`Communication with ID "${id}" not found`);
    }

    return communication;
  }

  /**
   * Update a communication record
   */
  async update(tenantId: string, id: string, dto: UpdateCommunicationDto, userId: string) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.communication.update({
      where: { id },
      data: {
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.sentAt !== undefined && { sentAt: new Date(dto.sentAt) }),
        ...(dto.readAt !== undefined && { readAt: new Date(dto.readAt) }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as Prisma.InputJsonValue }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'communication',
      entityId: id,
      action: 'updated',
      description: `Communication updated`,
      performedBy: userId,
    });

    return updated;
  }

  /**
   * Delete a communication record
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.communication.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'communication',
      entityId: id,
      action: 'deleted',
      description: `Communication deleted`,
      performedBy: userId,
    });

    this.logger.log(`Communication deleted: ${id}`);
    return { deleted: true };
  }
}
