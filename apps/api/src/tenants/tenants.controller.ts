// ============================================================
// Tenants Controller — Tenant provisioning endpoints
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ChangeTenantStatusDto } from './dto/change-tenant-status.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Tenants')
@ApiBearerAuth('access-token')
@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * SECURITY: Ensure TENANT_ADMIN can only access their own tenant.
   * SUPER_ADMIN can access any tenant.
   */
  private assertTenantAccess(user: JwtUser, targetTenantId: string): void {
    if (user.role !== UserRole.SUPER_ADMIN && user.tenantId !== targetTenantId) {
      throw new ForbiddenException('You can only access your own tenant');
    }
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant (SuperAdmin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden — SuperAdmin only' })
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all tenants (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of tenants' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get tenant details' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant details' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    this.assertTenantAccess(user, id);
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update tenant details' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant updated' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateTenantDto) {
    this.assertTenantAccess(user, id);
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a tenant (SuperAdmin only)' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Change tenant status (SuperAdmin only)' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Status changed' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async changeStatus(@Param('id') id: string, @Body() dto: ChangeTenantStatusDto) {
    return this.tenantsService.changeStatus(id, dto);
  }
}
