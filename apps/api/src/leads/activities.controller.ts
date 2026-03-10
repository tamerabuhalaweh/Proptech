// ============================================================
// Activities Controller — Lead follow-up activities
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
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ActivitiesService } from './activities.service';
import {
  CreateLeadActivityDto,
  UpdateLeadActivityDto,
  CompleteActivityDto,
  QueryActivityDto,
} from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Activities under /leads/:leadId/activities
 */
@ApiTags('Lead Activities')
@ApiBearerAuth('access-token')
@Controller('leads/:leadId/activities')
@UseGuards(RolesGuard)
export class LeadActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an activity for a lead' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({ status: 201, description: 'Activity created' })
  async create(
    @CurrentUser() user: JwtUser,
    @Param('leadId') leadId: string,
    @Body() dto: CreateLeadActivityDto,
  ) {
    return this.activitiesService.create(user.tenantId, leadId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List activities for a lead' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Paginated list of activities' })
  async findByLead(
    @CurrentUser() user: JwtUser,
    @Param('leadId') leadId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.activitiesService.findByLead(user.tenantId, leadId, query);
  }

  @Patch(':activityId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @ApiOperation({ summary: 'Update an activity' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity updated' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('activityId') activityId: string,
    @Body() dto: UpdateLeadActivityDto,
  ) {
    return this.activitiesService.update(user.tenantId, activityId, dto, user.sub);
  }

  @Post(':activityId/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @ApiOperation({ summary: 'Complete an activity with outcome' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity completed' })
  async complete(
    @CurrentUser() user: JwtUser,
    @Param('activityId') activityId: string,
    @Body() dto: CompleteActivityDto,
  ) {
    return this.activitiesService.complete(user.tenantId, activityId, dto, user.sub);
  }

  @Delete(':activityId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({ name: 'leadId', description: 'Lead ID' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity deleted' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('activityId') activityId: string,
  ) {
    return this.activitiesService.remove(user.tenantId, activityId, user.sub);
  }
}

/**
 * Standalone /activities endpoints for current user
 */
@ApiTags('Lead Activities')
@ApiBearerAuth('access-token')
@Controller('activities')
@UseGuards(RolesGuard)
export class UserActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming activities for the current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default 20)' })
  @ApiResponse({ status: 200, description: 'List of upcoming activities' })
  async getUpcoming(
    @CurrentUser() user: JwtUser,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getUpcoming(user.tenantId, user.sub, limit || 20);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue activities for the current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max results (default 20)' })
  @ApiResponse({ status: 200, description: 'List of overdue activities' })
  async getOverdue(
    @CurrentUser() user: JwtUser,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getOverdue(user.tenantId, user.sub, limit || 20);
  }
}
