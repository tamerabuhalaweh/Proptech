// ============================================================
// Lead Query DTO — Pagination + filters
// ============================================================

import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LeadSource, LeadStage } from '@prisma/client';
import { PaginationQueryDto } from '../../tenants/dto/pagination-query.dto';

export class QueryLeadDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeadStage, description: 'Filter by pipeline stage' })
  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @ApiPropertyOptional({ enum: LeadSource, description: 'Filter by lead source' })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ example: 'user_abc123', description: 'Filter by assigned user' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ example: 'prop_abc123', description: 'Filter by property' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: 0, description: 'Minimum score' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  scoreMin?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum score' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  scoreMax?: number;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Created after date' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Created before date' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ example: 'Ahmed', description: 'Search in name, email, phone, notes' })
  @IsOptional()
  @IsString()
  search?: string;
}
