// ============================================================
// Assign Lead DTO
// ============================================================

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignLeadDto {
  @ApiProperty({ example: 'user_abc123', description: 'User ID to assign the lead to' })
  @IsString()
  assignedTo!: string;

  @ApiPropertyOptional({ description: 'Reason for assignment' })
  @IsOptional()
  @IsString()
  reason?: string;
}
