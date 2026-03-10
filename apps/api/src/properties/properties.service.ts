// ============================================================
// Properties Service — CRUD + soft-delete
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Create a new property
   */
  async create(tenantId: string, dto: CreatePropertyDto, userId: string) {
    const property = await this.prisma.property.create({
      data: {
        tenantId,
        name: dto.name,
        nameAr: dto.nameAr,
        description: dto.description,
        descriptionAr: dto.descriptionAr,
        type: dto.type,
        status: dto.status,
        location: dto.location,
        city: dto.city,
        totalUnits: dto.totalUnits ?? 0,
        coverImage: dto.coverImage,
        images: dto.images ?? [],
        amenities: dto.amenities ?? [],
      },
      include: {
        _count: { select: { buildings: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'property',
      entityId: property.id,
      action: 'created',
      description: `Property "${property.name}" created`,
      performedBy: userId,
    });

    this.logger.log(`Property created: ${property.name} (${property.id})`);
    return property;
  }

  /**
   * List properties with pagination and filters
   */
  async findAll(tenantId: string, query: QueryPropertyDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.city && { city: { contains: query.city, mode: 'insensitive' as const } }),
      ...(query.location && { location: { contains: query.location, mode: 'insensitive' as const } }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { nameAr: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          _count: { select: { buildings: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single property by ID
   */
  async findOne(tenantId: string, id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        buildings: {
          include: {
            _count: { select: { units: true } },
          },
        },
        _count: { select: { buildings: true } },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    return property;
  }

  /**
   * Update a property
   */
  async update(tenantId: string, id: string, dto: UpdatePropertyDto, userId: string) {
    await this.findOne(tenantId, id);

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.nameAr !== undefined && { nameAr: dto.nameAr }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.descriptionAr !== undefined && { descriptionAr: dto.descriptionAr }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.totalUnits !== undefined && { totalUnits: dto.totalUnits }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
      },
      include: {
        _count: { select: { buildings: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'property',
      entityId: property.id,
      action: 'updated',
      description: `Property "${property.name}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Property updated: ${property.name} (${property.id})`);
    return property;
  }

  /**
   * Soft-delete a property
   */
  async remove(tenantId: string, id: string, userId: string) {
    const existing = await this.findOne(tenantId, id);

    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.activity.log({
      tenantId,
      entityType: 'property',
      entityId: id,
      action: 'deleted',
      description: `Property "${existing.name}" soft-deleted`,
      performedBy: userId,
    });

    this.logger.log(`Property soft-deleted: ${existing.name} (${id})`);
    return { message: `Property "${existing.name}" has been deleted` };
  }
}
