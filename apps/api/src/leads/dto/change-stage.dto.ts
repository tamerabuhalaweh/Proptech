// ============================================================
// Change Lead Stage DTO
// ============================================================

import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStage } from '@prisma/client';

export class ChangeStageDto {
  @ApiProperty({ enum: LeadStage, description: 'Target stage' })
  @IsEnum(LeadStage)
  stage!: LeadStage;

  @ApiPropertyOptional({ description: 'Reason for losing the lead (required when stage = LOST)' })
  @ValidateIf((o) => o.stage === LeadStage.LOST)
  @IsString()
  lostReason?: string;

  @ApiPropertyOptional({ description: 'Notes about the stage transition' })
  @IsOptional()
  @IsString()
  notes?: string;
}
