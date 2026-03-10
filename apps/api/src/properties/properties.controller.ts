// ============================================================
// Properties Controller — Property management endpoints
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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Properties')
@ApiBearerAuth('access-token')
@Controller('properties')
@UseGuards(RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(user.tenantId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List properties (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of properties' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryPropertyDto,
  ) {
    return this.propertiesService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.propertiesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update property details' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property updated' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(user.tenantId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property deleted' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.propertiesService.remove(user.tenantId, id, user.sub);
  }
}
