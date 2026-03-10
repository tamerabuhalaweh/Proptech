// ============================================================
// Update Tenant DTO
// ============================================================

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Updated Company Name', description: 'Tenant name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'TL-99999', description: 'Trade license number' })
  @IsOptional()
  @IsString()
  tradeLicense?: string;

  @ApiPropertyOptional({ example: 'VAT-11111', description: 'VAT registration number' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'new@email.com', description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: 'AE', description: 'Country code' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @ApiPropertyOptional({ description: 'Tenant configuration (JSON)', type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
