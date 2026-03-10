// ============================================================
// Dashboard Controller — Stats, activity, top properties
// ============================================================

import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, JwtUser } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getStats(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getStats(user.tenantId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items (default 20)' })
  @ApiResponse({ status: 200, description: 'Recent activity log' })
  async getActivity(
    @CurrentUser() user: JwtUser,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getActivity(
      user.tenantId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('top-properties')
  @ApiOperation({ summary: 'Get top 5 properties by occupancy' })
  @ApiResponse({ status: 200, description: 'Top properties ranked by occupancy' })
  async getTopProperties(@CurrentUser() user: JwtUser) {
    return this.dashboardService.getTopProperties(user.tenantId);
  }
}
