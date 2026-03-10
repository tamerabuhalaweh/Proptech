// ============================================================
// Tenants Service — CRUD + status management
// ============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, TenantStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ChangeTenantStatusDto } from './dto/change-tenant-status.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { generateSlug } from '@proptech/config';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new tenant
   */
  async create(dto: CreateTenantDto) {
    // Generate slug if not provided
    const slug = dto.slug || generateSlug(dto.name);

    // Check slug uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException(`Tenant with slug "${slug}" already exists`);
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug,
        tradeLicense: dto.tradeLicense,
        vatNumber: dto.vatNumber,
        contactEmail: dto.contactEmail,
        country: dto.country || 'SA',
        config: (dto.config as Prisma.InputJsonValue) || {},
      },
    });

    this.logger.log(`Tenant created: ${tenant.name} (${tenant.slug})`);
    return tenant;
  }

  /**
   * List all tenants with pagination
   */
  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          contactEmail: true,
          country: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              projects: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
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
   * Get a single tenant by ID
   */
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!tenant || tenant.deletedAt) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return tenant;
  }

  /**
   * Update tenant details
   */
  async update(id: string, dto: UpdateTenantDto) {
    // Verify tenant exists
    await this.findOne(id);

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.tradeLicense !== undefined && { tradeLicense: dto.tradeLicense }),
        ...(dto.vatNumber !== undefined && { vatNumber: dto.vatNumber }),
        ...(dto.contactEmail && { contactEmail: dto.contactEmail }),
        ...(dto.country && { country: dto.country }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
      },
    });

    this.logger.log(`Tenant updated: ${tenant.name} (${tenant.id})`);
    return tenant;
  }

  /**
   * Soft-delete a tenant
   */
  async remove(id: string) {
    await this.findOne(id);

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: TenantStatus.ARCHIVED,
      },
    });

    this.logger.log(`Tenant soft-deleted: ${tenant.name} (${tenant.id})`);
    return { message: `Tenant "${tenant.name}" has been deleted` };
  }

  /**
   * Change tenant status
   */
  async changeStatus(id: string, dto: ChangeTenantStatusDto) {
    await this.findOne(id);

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status: dto.status },
    });

    this.logger.log(`Tenant status changed: ${tenant.name} → ${dto.status}`);
    return tenant;
  }
}
