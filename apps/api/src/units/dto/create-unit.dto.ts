// ============================================================
// Create Unit DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType, UnitStatus } from '@prisma/client';

export class CreateUnitDto {
  @ApiProperty({ example: 'A-101', description: 'Unit number' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  unitNumber!: string;

  @ApiProperty({ example: 1, description: 'Floor number' })
  @IsInt()
  @Min(0)
  floor!: number;

  @ApiPropertyOptional({ enum: UnitType, default: UnitType.STUDIO })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiProperty({ example: 85.5, description: 'Area in square meters' })
  @IsNumber()
  @Min(0)
  area!: number;

  @ApiPropertyOptional({ enum: UnitStatus, default: UnitStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiPropertyOptional({ example: 500000, description: 'Base price in SAR', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'sea', description: 'View description' })
  @IsOptional()
  @IsString()
  view?: string;

  @ApiPropertyOptional({ example: ['balcony', 'parking', 'storage'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 'Corner unit with extra windows' })
  @IsOptional()
  @IsString()
  notes?: string;
}
