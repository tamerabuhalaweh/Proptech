// ============================================================
// Locale Controller — Tenant locale settings, Hijri conversion
// ============================================================

import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
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
import { LocaleService } from './locale.service';
import { UpdateLocaleDto } from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Locale')
@ApiBearerAuth('access-token')
@Controller('locale')
@UseGuards(RolesGuard)
export class LocaleController {
  constructor(private readonly localeService: LocaleService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant locale settings' })
  @ApiResponse({ status: 200, description: 'Locale settings' })
  async getSettings(@CurrentUser() user: JwtUser) {
    return this.localeService.getSettings(user.tenantId);
  }

  @Patch()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update tenant locale settings' })
  @ApiResponse({ status: 200, description: 'Locale settings updated' })
  async updateSettings(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateLocaleDto,
  ) {
    return this.localeService.updateSettings(user.tenantId, dto, user.sub);
  }

  @Get('hijri/:date')
  @ApiOperation({ summary: 'Convert Gregorian date to Hijri' })
  @ApiParam({ name: 'date', description: 'Gregorian date (YYYY-MM-DD or ISO string)', example: '2026-03-11' })
  @ApiResponse({ status: 200, description: 'Hijri date conversion result' })
  async convertToHijri(@Param('date') date: string) {
    return this.localeService.convertToHijri(date);
  }
}
