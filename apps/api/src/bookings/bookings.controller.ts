// ============================================================
// Bookings Controller — Booking management, flow transitions
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
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
import { BookingsService } from './bookings.service';
import { CreateBookingDto, QueryBookingDto, CancelBookingDto, CheckExpiryDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ============================================================
  // Static routes MUST come before :id param routes
  // ============================================================

  @Post('check-expiry')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process expired bookings' })
  @ApiResponse({ status: 200, description: 'Expired bookings processed' })
  async checkExpiry(
    @CurrentUser() user: JwtUser,
    @Body() dto: CheckExpiryDto,
  ) {
    return this.bookingsService.checkExpiry(user.tenantId, dto, user.sub);
  }

  // ============================================================
  // CRUD
  // ============================================================

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Unit not available' })
  @ApiResponse({ status: 409, description: 'Unit already has an active booking' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.tenantId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of bookings' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryBookingDto,
  ) {
    return this.bookingsService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.findOne(user.tenantId, id);
  }

  // ============================================================
  // Status Transitions
  // ============================================================

  @Patch(':id/confirm')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Confirm a pending booking (sets unit to SOLD)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async confirm(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.confirm(user.tenantId, id, user.sub);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel a booking (releases unit)' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async cancel(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(user.tenantId, id, dto, user.sub);
  }

  @Patch(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Mark booking as completed' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking completed' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async complete(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.complete(user.tenantId, id, user.sub);
  }
}
