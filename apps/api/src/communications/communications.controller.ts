// ============================================================
// Communications Controller — Communication log management
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
import { CommunicationsService } from './communications.service';
import {
  CreateCommunicationDto,
  UpdateCommunicationDto,
  QueryCommunicationDto,
} from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Communications')
@ApiBearerAuth('access-token')
@Controller('communications')
@UseGuards(RolesGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a new communication' })
  @ApiResponse({ status: 201, description: 'Communication logged' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommunicationDto,
  ) {
    return this.communicationsService.create(user.tenantId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List communications (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of communications' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryCommunicationDto,
  ) {
    return this.communicationsService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication details' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 200, description: 'Communication details' })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.communicationsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @ApiOperation({ summary: 'Update a communication' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 200, description: 'Communication updated' })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommunicationDto,
  ) {
    return this.communicationsService.update(user.tenantId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete a communication' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 200, description: 'Communication deleted' })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.communicationsService.remove(user.tenantId, id, user.sub);
  }
}
