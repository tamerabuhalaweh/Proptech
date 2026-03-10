// ============================================================
// Create Building DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Tower A', description: 'Building name' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'البرج أ', description: 'Arabic name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameAr?: string;

  @ApiPropertyOptional({ example: 15, description: 'Total number of floors', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalFloors?: number;

  @ApiPropertyOptional({ example: 60, description: 'Total number of units', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalUnits?: number;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
