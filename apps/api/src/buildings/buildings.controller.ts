// ============================================================
// Buildings Controller — Nested under properties
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Buildings')
@ApiBearerAuth('access-token')
@Controller('properties/:propertyId/buildings')
@UseGuards(RolesGuard)
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a building within a property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 201, description: 'Building created' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async create(
    @CurrentUser() user: JwtUser,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateBuildingDto,
  ) {
    return this.buildingsService.create(user.tenantId, propertyId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List buildings for a property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'List of buildings' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Param('propertyId') propertyId: string,
  ) {
    return this.buildingsService.findAll(user.tenantId, propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building details' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({ status: 200, description: 'Building details' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
  ) {
    return this.buildingsService.findOne(user.tenantId, propertyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update building details' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({ status: 200, description: 'Building updated' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
  ) {
    return this.buildingsService.update(user.tenantId, propertyId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a building' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiParam({ name: 'id', description: 'Building ID' })
  @ApiResponse({ status: 200, description: 'Building deleted' })
  @ApiResponse({ status: 404, description: 'Building not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('propertyId') propertyId: string,
    @Param('id') id: string,
  ) {
    return this.buildingsService.remove(user.tenantId, propertyId, id, user.sub);
  }
}
