// ============================================================
// Create Discount DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {
  @ApiProperty({ description: 'Unit ID' })
  @IsString()
  unitId!: string;

  @ApiProperty({ example: 'percentage', description: 'Discount type: percentage or fixed' })
  @IsString()
  @IsIn(['percentage', 'fixed'])
  type!: string;

  @ApiProperty({ example: 10, description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ example: 'Early bird promotion' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00Z', description: 'Valid from date' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59Z', description: 'Valid to date' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}
