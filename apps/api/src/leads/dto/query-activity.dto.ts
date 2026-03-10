// ============================================================
// Activity Query DTO
// ============================================================

import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import { PaginationQueryDto } from '../../tenants/dto/pagination-query.dto';

export class QueryActivityDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ActivityType, description: 'Filter by activity type' })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Scheduled after' })
  @IsOptional()
  @IsDateString()
  scheduledFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Scheduled before' })
  @IsOptional()
  @IsDateString()
  scheduledTo?: string;
}
