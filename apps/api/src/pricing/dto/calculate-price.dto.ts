// ============================================================
// Calculate Price DTO — Unit pricing matrix
// ============================================================

import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculatePriceDto {
  @ApiProperty({ description: 'Unit ID to calculate price for' })
  @IsString()
  unitId!: string;

  @ApiPropertyOptional({ example: 50, description: 'Floor premium per floor (SAR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floorPremium?: number;

  @ApiPropertyOptional({ example: 10000, description: 'View premium (SAR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  viewPremium?: number;

  @ApiPropertyOptional({ example: [5000, 3000], description: 'Feature premiums array (SAR)' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  featurePremiums?: number[];
}
