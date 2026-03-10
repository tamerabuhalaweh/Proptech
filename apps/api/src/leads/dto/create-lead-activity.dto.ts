// ============================================================
// Create Lead Activity DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class CreateLeadActivityDto {
  @ApiProperty({ enum: ActivityType, description: 'Activity type' })
  @IsEnum(ActivityType)
  type!: ActivityType;

  @ApiProperty({ example: 'Follow-up call', description: 'Activity title' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Discussed pricing options', description: 'Details' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-06-15T10:00:00Z', description: 'Scheduled date/time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
