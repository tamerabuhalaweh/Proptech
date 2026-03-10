// ============================================================
// Update Price DTO — Manual price change with audit trail
// ============================================================

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePriceDto {
  @ApiProperty({ description: 'Unit ID' })
  @IsString()
  unitId!: string;

  @ApiProperty({ example: 550000, description: 'New price in SAR' })
  @IsNumber()
  @Min(0)
  newPrice!: number;

  @ApiPropertyOptional({ example: 'Market adjustment', description: 'Reason for price change' })
  @IsOptional()
  @IsString()
  reason?: string;
}
