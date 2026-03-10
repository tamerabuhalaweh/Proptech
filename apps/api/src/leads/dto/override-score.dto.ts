// ============================================================
// Override Lead Score DTO
// ============================================================

import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OverrideScoreDto {
  @ApiProperty({ example: 85, description: 'Manual score override (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ description: 'Reason for override' })
  @IsOptional()
  @IsString()
  reason?: string;
}
