// ============================================================
// Subscriptions Controller — Plan management, usage
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpgradeSubscriptionDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@Controller('subscriptions')
@UseGuards(RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // ============================================================
  // Static routes first
  // ============================================================

  @Get('current')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get current subscription with usage stats' })
  @ApiResponse({ status: 200, description: 'Current subscription details' })
  async getCurrent(@CurrentUser() user: JwtUser) {
    return this.subscriptionsService.getCurrent(user.tenantId);
  }

  @Get('usage')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get usage vs limits' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  async getUsage(@CurrentUser() user: JwtUser) {
    return this.subscriptionsService.getUsageStats(user.tenantId);
  }

  @Patch('upgrade')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription upgraded' })
  @ApiResponse({ status: 400, description: 'Invalid upgrade' })
  async upgrade(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgrade(user.tenantId, dto, user.sub);
  }

  @Patch('downgrade')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Downgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription downgraded' })
  @ApiResponse({ status: 400, description: 'Usage exceeds new plan limits' })
  async downgrade(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.downgrade(user.tenantId, dto, user.sub);
  }

  // ============================================================
  // Admin
  // ============================================================

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a subscription for a tenant' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(dto, user.sub);
  }
}
