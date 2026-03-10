// ============================================================
// Create Campaign DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2026', description: 'Campaign name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'percentage', default: 'percentage', enum: ['percentage', 'fixed'] })
  @IsOptional()
  @IsString()
  discountType?: string;

  @ApiProperty({ example: 10, description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', description: 'Campaign start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-08-31T23:59:59Z', description: 'Campaign end date' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: ['prop1', 'prop2'], description: 'Targeted property IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyIds?: string[];

  @ApiPropertyOptional({ example: ['unit1', 'unit2'], description: 'Targeted unit IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unitIds?: string[];
}
