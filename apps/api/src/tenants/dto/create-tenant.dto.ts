// ============================================================
// Create Tenant DTO
// ============================================================

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Smart Labs Real Estate', description: 'Tenant name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name!: string;

  @ApiPropertyOptional({
    example: 'smart-labs',
    description: 'URL-safe slug (auto-generated from name if not provided)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Slug must be at least 3 characters' })
  @MaxLength(50, { message: 'Slug must not exceed 50 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'TL-12345', description: 'Trade license number' })
  @IsOptional()
  @IsString()
  tradeLicense?: string;

  @ApiPropertyOptional({ example: 'VAT-67890', description: 'VAT registration number' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiProperty({ example: 'admin@smartlabs.sa', description: 'Primary contact email' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  contactEmail!: string;

  @ApiPropertyOptional({ example: 'SA', description: 'Country code (default: SA)' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @ApiPropertyOptional({ description: 'Tenant configuration (JSON)', type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
