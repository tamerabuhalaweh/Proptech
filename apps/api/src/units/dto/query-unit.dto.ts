// ============================================================
// Unit Query DTO — Pagination + filters
// ============================================================

import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UnitType, UnitStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../tenants/dto/pagination-query.dto';

export class QueryUnitDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UnitType, description: 'Filter by unit type' })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({ enum: UnitStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiPropertyOptional({ example: 5, description: 'Filter by floor number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  floor?: number;

  @ApiPropertyOptional({ example: 'sea', description: 'Filter by view' })
  @IsOptional()
  @IsString()
  view?: string;

  @ApiPropertyOptional({ description: 'Filter by building ID' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
