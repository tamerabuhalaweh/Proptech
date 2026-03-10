// ============================================================
// Units Controller — Flat + nested routes
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, BulkCreateUnitsDto, QueryUnitDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Flat routes: /api/units
 */
@ApiTags('Units')
@ApiBearerAuth('access-token')
@Controller('units')
@UseGuards(RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'List all units (flat, paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of units' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryUnitDto,
  ) {
    return this.unitsService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit details' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit details' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.unitsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update unit details' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit updated' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.unitsService.update(user.tenantId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiParam({ name: 'id', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Unit deleted' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.unitsService.remove(user.tenantId, id, user.sub);
  }

  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk import units' })
  @ApiResponse({ status: 201, description: 'Bulk import results' })
  async bulkCreate(
    @CurrentUser() user: JwtUser,
    @Body() dto: BulkCreateUnitsDto,
  ) {
    return this.unitsService.bulkCreate(user.tenantId, dto, user.sub);
  }
}

/**
 * Nested routes: /api/buildings/:buildingId/units
 */
@ApiTags('Units (Building)')
@ApiBearerAuth('access-token')
@Controller('buildings/:buildingId/units')
@UseGuards(RolesGuard)
export class BuildingUnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a unit in a building' })
  @ApiParam({ name: 'buildingId', description: 'Building ID' })
  @ApiResponse({ status: 201, description: 'Unit created' })
  async create(
    @CurrentUser() user: JwtUser,
    @Param('buildingId') buildingId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.unitsService.create(user.tenantId, buildingId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List units in a building' })
  @ApiParam({ name: 'buildingId', description: 'Building ID' })
  @ApiResponse({ status: 200, description: 'List of units' })
  async findByBuilding(
    @CurrentUser() user: JwtUser,
    @Param('buildingId') buildingId: string,
    @Query() query: QueryUnitDto,
  ) {
    return this.unitsService.findByBuilding(user.tenantId, buildingId, query);
  }
}
