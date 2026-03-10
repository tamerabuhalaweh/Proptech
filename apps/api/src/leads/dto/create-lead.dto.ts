// ============================================================
// Create Lead DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  IsEmail,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ example: 'Ahmed Al-Rashid', description: 'Lead name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'ahmed@example.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+966501234567', description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.WEBSITE, description: 'Lead source' })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ example: 'prop_abc123', description: 'Interested property ID' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: { bedrooms: 3, floor: 'high' }, description: 'Unit preferences' })
  @IsOptional()
  @IsObject()
  unitPreferences?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 500000, description: 'Minimum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: 1000000, description: 'Maximum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ example: 'Interested in 3BR with sea view', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: ['VIP', 'investor'], description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'user_abc123', description: 'Assign to user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
