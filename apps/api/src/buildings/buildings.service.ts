// ============================================================
// Buildings Service — CRUD for buildings within a property
// ============================================================

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Verify property exists and belongs to tenant
   */
  private async verifyProperty(tenantId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, tenantId, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }
    return property;
  }

  /**
   * Create a building within a property
   */
  async create(tenantId: string, propertyId: string, dto: CreateBuildingDto, userId: string) {
    await this.verifyProperty(tenantId, propertyId);

    const building = await this.prisma.building.create({
      data: {
        tenantId,
        propertyId,
        name: dto.name,
        nameAr: dto.nameAr,
        totalFloors: dto.totalFloors ?? 1,
        totalUnits: dto.totalUnits ?? 0,
        status: dto.status,
      },
      include: {
        _count: { select: { units: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'building',
      entityId: building.id,
      action: 'created',
      description: `Building "${building.name}" created in property ${propertyId}`,
      performedBy: userId,
    });

    this.logger.log(`Building created: ${building.name} (${building.id})`);
    return building;
  }

  /**
   * List buildings for a property
   */
  async findAll(tenantId: string, propertyId: string) {
    await this.verifyProperty(tenantId, propertyId);

    return this.prisma.building.findMany({
      where: { tenantId, propertyId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { units: true } },
      },
    });
  }

  /**
   * Get a single building
   */
  async findOne(tenantId: string, propertyId: string, id: string) {
    await this.verifyProperty(tenantId, propertyId);

    const building = await this.prisma.building.findFirst({
      where: { id, tenantId, propertyId },
      include: {
        units: true,
        _count: { select: { units: true } },
      },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID "${id}" not found`);
    }

    return building;
  }

  /**
   * Update a building
   */
  async update(tenantId: string, propertyId: string, id: string, dto: UpdateBuildingDto, userId: string) {
    await this.findOne(tenantId, propertyId, id);

    const building = await this.prisma.building.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.nameAr !== undefined && { nameAr: dto.nameAr }),
        ...(dto.totalFloors !== undefined && { totalFloors: dto.totalFloors }),
        ...(dto.totalUnits !== undefined && { totalUnits: dto.totalUnits }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        _count: { select: { units: true } },
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'building',
      entityId: building.id,
      action: 'updated',
      description: `Building "${building.name}" updated`,
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Building updated: ${building.name} (${building.id})`);
    return building;
  }

  /**
   * Delete a building
   */
  async remove(tenantId: string, propertyId: string, id: string, userId: string) {
    const existing = await this.findOne(tenantId, propertyId, id);

    // Check for units
    const unitCount = await this.prisma.unit.count({ where: { buildingId: id, tenantId } });
    if (unitCount > 0) {
      throw new NotFoundException(`Cannot delete building with ${unitCount} units. Remove units first.`);
    }

    await this.prisma.building.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'building',
      entityId: id,
      action: 'deleted',
      description: `Building "${existing.name}" deleted`,
      performedBy: userId,
    });

    this.logger.log(`Building deleted: ${existing.name} (${id})`);
    return { message: `Building "${existing.name}" has been deleted` };
  }
}
