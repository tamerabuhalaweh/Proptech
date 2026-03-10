// ============================================================
// Pricing Controller — Pricing matrix, discounts, audit
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
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PricingService } from './pricing.service';
import { CalculatePriceDto, CreateDiscountDto, ApproveDiscountDto, UpdatePriceDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Pricing')
@ApiBearerAuth('access-token')
@Controller('pricing')
@UseGuards(RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // ---- Price Calculation & Updates ----

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate effective price for a unit' })
  @ApiResponse({ status: 200, description: 'Price breakdown' })
  async calculatePrice(
    @CurrentUser() user: JwtUser,
    @Body() dto: CalculatePriceDto,
  ) {
    return this.pricingService.calculatePrice(user.tenantId, dto);
  }

  @Post('update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update unit price with audit trail' })
  @ApiResponse({ status: 200, description: 'Price updated' })
  async updatePrice(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.pricingService.updatePrice(user.tenantId, dto, user.sub);
  }

  @Get('history/:unitId')
  @ApiOperation({ summary: 'Get price history for a unit' })
  @ApiParam({ name: 'unitId', description: 'Unit ID' })
  @ApiResponse({ status: 200, description: 'Price change history' })
  async getPriceHistory(
    @CurrentUser() user: JwtUser,
    @Param('unitId') unitId: string,
  ) {
    return this.pricingService.getPriceHistory(user.tenantId, unitId);
  }

  // ---- Discount Management ----

  @Post('discounts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a discount request' })
  @ApiResponse({ status: 201, description: 'Discount created (pending approval)' })
  async createDiscount(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateDiscountDto,
  ) {
    return this.pricingService.createDiscount(user.tenantId, dto, user.sub);
  }

  @Patch('discounts/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Approve or reject a discount' })
  @ApiParam({ name: 'id', description: 'Discount ID' })
  @ApiResponse({ status: 200, description: 'Discount status updated' })
  async approveDiscount(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: ApproveDiscountDto,
  ) {
    return this.pricingService.approveDiscount(user.tenantId, id, dto, user.sub);
  }

  @Get('discounts')
  @ApiOperation({ summary: 'List discounts (optionally filter by unit)' })
  @ApiQuery({ name: 'unitId', required: false, description: 'Filter by unit ID' })
  @ApiResponse({ status: 200, description: 'List of discounts' })
  async listDiscounts(
    @CurrentUser() user: JwtUser,
    @Query('unitId') unitId?: string,
  ) {
    return this.pricingService.listDiscounts(user.tenantId, unitId);
  }
}
