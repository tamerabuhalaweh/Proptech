// ============================================================
// Property Query DTO — Pagination + filters
// ============================================================

import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, ProjectStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../tenants/dto/pagination-query.dto';

export class QueryPropertyDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: PropertyType, description: 'Filter by property type' })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: 'Riyadh', description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Al Olaya', description: 'Filter by location (partial match)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'tower', description: 'Search in name/description' })
  @IsOptional()
  @IsString()
  search?: string;
}
