// ============================================================
// Bulk Create Units DTO
// ============================================================

import { IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUnitDto } from './create-unit.dto';

export class BulkCreateUnitsDto {
  @ApiProperty({ description: 'Building ID to add units to' })
  @IsString()
  buildingId!: string;

  @ApiProperty({ type: [CreateUnitDto], description: 'Array of units to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUnitDto)
  units!: CreateUnitDto[];
}
