// ============================================================
// Milestones Controller — Payment milestones & installments
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
import { MilestonesService } from './milestones.service';
import {
  CreateMilestoneDto,
  UpdateMilestoneDto,
  PayMilestoneDto,
  QueryMilestoneDto,
} from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Milestones')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(RolesGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  // ============================================================
  // Booking-scoped route
  // ============================================================

  @Get('bookings/:bookingId/milestones')
  @ApiOperation({ summary: 'List milestones for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Milestones for the booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findByBooking(
    @CurrentUser() user: JwtUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.milestonesService.findByBooking(user.tenantId, bookingId);
  }

  // ============================================================
  // Static routes before :id
  // ============================================================

  @Get('milestones/overdue')
  @ApiOperation({ summary: 'List all overdue milestones for tenant' })
  @ApiResponse({ status: 200, description: 'Overdue milestones' })
  async findOverdue(@CurrentUser() user: JwtUser) {
    return this.milestonesService.findOverdue(user.tenantId);
  }

  // ============================================================
  // CRUD
  // ============================================================

  @Post('milestones')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a milestone' })
  @ApiResponse({ status: 201, description: 'Milestone created' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(user.tenantId, dto, user.sub);
  }

  @Get('milestones')
  @ApiOperation({ summary: 'List milestones (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated milestones' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryMilestoneDto,
  ) {
    return this.milestonesService.findAll(user.tenantId, query);
  }

  @Get('milestones/:id')
  @ApiOperation({ summary: 'Get milestone details' })
  @ApiParam({ name: 'id', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone details' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.milestonesService.findOne(user.tenantId, id);
  }

  @Patch('milestones/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiParam({ name: 'id', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone updated' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.update(user.tenantId, id, dto, user.sub);
  }

  @Patch('milestones/:id/pay')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Mark milestone as paid' })
  @ApiParam({ name: 'id', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone marked as paid' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  async pay(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: PayMilestoneDto,
  ) {
    return this.milestonesService.pay(user.tenantId, id, dto, user.sub);
  }

  @Delete('milestones/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiParam({ name: 'id', description: 'Milestone ID' })
  @ApiResponse({ status: 200, description: 'Milestone deleted' })
  @ApiResponse({ status: 404, description: 'Milestone not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.milestonesService.remove(user.tenantId, id, user.sub);
  }
}
