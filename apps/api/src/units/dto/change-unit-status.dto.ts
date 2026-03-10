// ============================================================
// Change Unit Status DTO
// ============================================================

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitStatus } from '@prisma/client';

export class ChangeUnitStatusDto {
  @ApiProperty({ enum: UnitStatus, description: 'New unit status' })
  @IsEnum(UnitStatus)
  status!: UnitStatus;
}
