// ============================================================
// Pay Milestone DTO
// ============================================================

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayMilestoneDto {
  @ApiProperty({ example: 'BANK_TRANSFER', description: 'Payment method used' })
  @IsString()
  paymentMethod!: string;

  @ApiPropertyOptional({ example: 'RCP-2026-001', description: 'Receipt number' })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional({ example: 'Paid via bank transfer' })
  @IsOptional()
  @IsString()
  notes?: string;
}
