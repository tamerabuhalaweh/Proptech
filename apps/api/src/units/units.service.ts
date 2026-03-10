// ============================================================
// Units Service — CRUD + status transitions + bulk import
// ============================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, UnitStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BulkCreateUnitsDto } from './dto/bulk-create-unit.dto';
import { QueryUnitDto } from './dto/query-unit.dto';

/**
 * Valid unit status transitions
 */
const VALID_TRANSITIONS: Record<UnitStatus, UnitStatus[]> = {
  [UnitStatus.AVAILABLE]: [UnitStatus.RESERVED, UnitStatus.BLOCKED, UnitStatus.UNDER_MAINTENANCE],
  [UnitStatus.RESERVED]: [UnitStatus.SOLD, UnitStatus.AVAILABLE, UnitStatus.BLOCKED],
  [UnitStatus.SOLD]: [], // terminal state
  [UnitStatus.BLOCKED]: [UnitStatus.AVAILABLE],
  [UnitStatus.UNDER_MAINTENANCE]: [UnitStatus.AVAILABLE],
};

@Injectable()
export class UnitsService {
  private readonly logger = new Logger(UnitsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Verify building exists and belongs to tenant
   */
  private async verifyBuilding(tenantId: string, buildingId: string) {
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId, tenantId },
    });
    if (!building) {
      throw new NotFoundException(`Building with ID "${buildingId}" not found`);
    }
    return building;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: UnitStatus, newStatus: UnitStatus) {
    if (currentStatus === newStatus) return; // no-op is fine
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }
  }

  /**
   * Create a unit within a building
   */
  async create(tenantId: string, buildingId: string, dto: CreateUnitDto, userId: string) {
    await this.verifyBuilding(tenantId, buildingId);

    const unit = await this.prisma.unit.create({
      data: {
        tenantId,
        buildingId,
        unitNumber: dto.unitNumber,
        floor: dto.floor,
        type: dto.type,
        area: dto.area,
        status: dto.status,
        basePrice: dto.basePrice ?? 0,
        view: dto.view,
        features: dto.features ?? [],
        notes: dto.notes,
      },
      include: { building: { select: { name: true, propertyId: true } } },
    });

    await this.activity.log({
      tenantId,
      entityType: 'unit',
      entityId: unit.id,
      action: 'created',
      description: `Unit "${unit.unitNumber}" created in building ${unit.building.name}`,
      performedBy: userId,
    });

    this.logger.log(`Unit created: ${unit.unitNumber} (${unit.id})`);
    return unit;
  }

  /**
   * List units with filters — flat list across all buildings
   */
  async findAll(tenantId: string, query: QueryUnitDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UnitWhereInput = {
      tenantId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.floor !== undefined && { floor: query.floor }),
      ...(query.view && { view: { contains: query.view, mode: 'insensitive' as const } }),
      ...(query.buildingId && { buildingId: query.buildingId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          building: { select: { id: true, name: true, propertyId: true } },
        },
      }),
      this.prisma.unit.count({ where }),
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
   * List units for a specific building
   */
  async findByBuilding(tenantId: string, buildingId: string, query: QueryUnitDto) {
    await this.verifyBuilding(tenantId, buildingId);
    return this.findAll(tenantId, { ...query, buildingId });
  }

  /**
   * Get a single unit
   */
  async findOne(tenantId: string, id: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tenantId },
      include: {
        building: { select: { id: true, name: true, propertyId: true } },
        discounts: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } },
        priceHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    return unit;
  }

  /**
   * Update a unit
   */
  async update(tenantId: string, id: string, dto: UpdateUnitDto, userId: string) {
    const existing = await this.findOne(tenantId, id);

    // Validate status transition if status is being changed
    if (dto.status && dto.status !== existing.status) {
      this.validateStatusTransition(existing.status, dto.status);
    }

    // Track price changes
    if (dto.basePrice !== undefined && dto.basePrice !== existing.basePrice) {
      await this.prisma.priceHistory.create({
        data: {
          tenantId,
          unitId: id,
          oldPrice: existing.basePrice,
          newPrice: dto.basePrice,
          changedBy: userId,
          reason: 'Manual price update',
        },
      });
    }

    const unit = await this.prisma.unit.update({
      where: { id },
      data: {
        ...(dto.unitNumber !== undefined && { unitNumber: dto.unitNumber }),
        ...(dto.floor !== undefined && { floor: dto.floor }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.area !== undefined && { area: dto.area }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
        ...(dto.view !== undefined && { view: dto.view }),
        ...(dto.features !== undefined && { features: dto.features }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        building: { select: { id: true, name: true, propertyId: true } },
      },
    });

    const action = dto.status && dto.status !== existing.status ? 'status_changed' : 'updated';
    await this.activity.log({
      tenantId,
      entityType: 'unit',
      entityId: unit.id,
      action,
      description: action === 'status_changed'
        ? `Unit "${unit.unitNumber}" status changed: ${existing.status} → ${dto.status}`
        : `Unit "${unit.unitNumber}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Unit updated: ${unit.unitNumber} (${unit.id})`);
    return unit;
  }

  /**
   * Delete a unit
   */
  async remove(tenantId: string, id: string, userId: string) {
    const existing = await this.findOne(tenantId, id);

    if (existing.status === UnitStatus.SOLD || existing.status === UnitStatus.RESERVED) {
      throw new BadRequestException(
        `Cannot delete unit with status "${existing.status}". Change status first.`,
      );
    }

    await this.prisma.unit.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'unit',
      entityId: id,
      action: 'deleted',
      description: `Unit "${existing.unitNumber}" deleted`,
      performedBy: userId,
    });

    this.logger.log(`Unit deleted: ${existing.unitNumber} (${id})`);
    return { message: `Unit "${existing.unitNumber}" has been deleted` };
  }

  /**
   * Bulk import units
   */
  async bulkCreate(tenantId: string, dto: BulkCreateUnitsDto, userId: string) {
    await this.verifyBuilding(tenantId, dto.buildingId);

    const results = {
      created: 0,
      errors: [] as { unitNumber: string; error: string }[],
    };

    // Process in chunks for performance
    for (const unitDto of dto.units) {
      try {
        await this.prisma.unit.create({
          data: {
            tenantId,
            buildingId: dto.buildingId,
            unitNumber: unitDto.unitNumber,
            floor: unitDto.floor,
            type: unitDto.type,
            area: unitDto.area,
            status: unitDto.status,
            basePrice: unitDto.basePrice ?? 0,
            view: unitDto.view,
            features: unitDto.features ?? [],
            notes: unitDto.notes,
          },
        });
        results.created++;
      } catch (error: any) {
        results.errors.push({
          unitNumber: unitDto.unitNumber,
          error: error.code === 'P2002'
            ? `Duplicate unit number "${unitDto.unitNumber}" in this building`
            : error.message,
        });
      }
    }

    await this.activity.log({
      tenantId,
      entityType: 'unit',
      entityId: dto.buildingId,
      action: 'bulk_created',
      description: `Bulk import: ${results.created} units created, ${results.errors.length} errors`,
      performedBy: userId,
      metadata: { results },
    });

    this.logger.log(`Bulk import: ${results.created} created, ${results.errors.length} errors`);
    return results;
  }
}
