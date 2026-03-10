// ============================================================
// Assignment Rule DTO
// ============================================================

import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssignmentStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  BY_PROPERTY = 'BY_PROPERTY',
  BY_SOURCE = 'BY_SOURCE',
}

export class AssignmentRuleDto {
  @ApiProperty({ enum: AssignmentStrategy, description: 'Assignment strategy' })
  @IsEnum(AssignmentStrategy)
  strategy!: AssignmentStrategy;

  @ApiPropertyOptional({ example: ['user1', 'user2'], description: 'User IDs for round-robin' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    example: { prop1: 'user1', prop2: 'user2' },
    description: 'Property-to-user mapping (for BY_PROPERTY)',
  })
  @IsOptional()
  propertyMapping?: Record<string, string>;

  @ApiPropertyOptional({
    example: { WEBSITE: 'user1', REFERRAL: 'user2' },
    description: 'Source-to-user mapping (for BY_SOURCE)',
  })
  @IsOptional()
  sourceMapping?: Record<string, string>;
}
