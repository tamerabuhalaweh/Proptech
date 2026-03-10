// ============================================================
// Complete Activity DTO
// ============================================================

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteActivityDto {
  @ApiProperty({ example: 'Client agreed to schedule site visit', description: 'Outcome' })
  @IsString()
  outcome!: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
