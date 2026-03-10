// ============================================================
// Check Expiry DTO
// ============================================================

import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckExpiryDto {
  @ApiPropertyOptional({ example: 14, description: 'Days after which pending bookings expire (default 14)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryDays?: number;
}
