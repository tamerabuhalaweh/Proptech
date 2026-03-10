// ============================================================
// Documents Service — Document management with storage limits
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  QueryDocumentDto,
  BulkUploadDocumentDto,
} from './dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Check storage limit against subscription plan
   */
  private async checkStorageLimit(tenantId: string, additionalBytes: number): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return; // No subscription = no limit
    }

    const storageLimit = subscription.storageGB * 1024 * 1024 * 1024; // Convert GB to bytes

    const currentUsage = await this.prisma.document.aggregate({
      where: { tenantId, isArchived: false },
      _sum: { sizeBytes: true },
    });

    const totalUsage = (currentUsage._sum.sizeBytes || 0) + additionalBytes;

    if (totalUsage > storageLimit) {
      throw new BadRequestException(
        `Storage limit exceeded. Plan allows ${subscription.storageGB}GB. ` +
          `Current usage: ${((currentUsage._sum.sizeBytes || 0) / (1024 * 1024 * 1024)).toFixed(2)}GB`,
      );
    }
  }

  /**
   * Create a document record
   */
  async create(tenantId: string, dto: CreateDocumentDto, userId: string) {
    await this.checkStorageLimit(tenantId, dto.sizeBytes || 0);

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        name: dto.name,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes || 0,
        category: dto.category || 'OTHER',
        entityType: dto.entityType,
        entityId: dto.entityId,
        uploadedBy: userId,
        description: dto.description || null,
        tags: dto.tags || [],
        url: dto.url,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'document',
      entityId: document.id,
      action: 'created',
      description: `Document "${dto.name}" uploaded — ${dto.entityType}/${dto.entityId}`,
      performedBy: userId,
      metadata: { category: dto.category, entityType: dto.entityType, entityId: dto.entityId },
    });

    this.logger.log(`Document created: ${document.id}`);
    return document;
  }

  /**
   * Bulk upload documents (metadata only)
   */
  async bulkUpload(tenantId: string, dto: BulkUploadDocumentDto, userId: string) {
    const totalSize = dto.documents.reduce((sum, doc) => sum + (doc.sizeBytes || 0), 0);
    await this.checkStorageLimit(tenantId, totalSize);

    const documents = await this.prisma.$transaction(
      dto.documents.map((doc) =>
        this.prisma.document.create({
          data: {
            tenantId,
            name: doc.name,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes || 0,
            category: doc.category || 'OTHER',
            entityType: doc.entityType,
            entityId: doc.entityId,
            uploadedBy: userId,
            description: doc.description || null,
            tags: doc.tags || [],
            url: doc.url,
          },
        }),
      ),
    );

    await this.activity.log({
      tenantId,
      entityType: 'document',
      entityId: 'bulk',
      action: 'bulk_upload',
      description: `${documents.length} documents uploaded`,
      performedBy: userId,
      metadata: { count: documents.length },
    });

    this.logger.log(`Bulk upload: ${documents.length} documents for tenant ${tenantId}`);
    return { uploaded: documents.length, documents };
  }

  /**
   * List documents with filters and pagination
   */
  async findAll(tenantId: string, query: QueryDocumentDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      tenantId,
      isArchived: false,
      ...(query.category && { category: query.category }),
      ...(query.entityType && { entityType: query.entityType }),
      ...(query.entityId && { entityId: query.entityId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single document by ID
   */
  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    return document;
  }

  /**
   * Update a document record
   */
  async update(tenantId: string, id: string, dto: UpdateDocumentDto, userId: string) {
    await this.findOne(tenantId, id);

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'document',
      entityId: id,
      action: dto.isArchived ? 'archived' : 'updated',
      description: dto.isArchived
        ? `Document archived`
        : `Document updated`,
      performedBy: userId,
    });

    return updated;
  }

  /**
   * Delete a document record
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.document.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'document',
      entityId: id,
      action: 'deleted',
      description: `Document deleted`,
      performedBy: userId,
    });

    this.logger.log(`Document deleted: ${id}`);
    return { deleted: true };
  }
}
