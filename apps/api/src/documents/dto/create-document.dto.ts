// ============================================================
// Create Document DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory, DocumentEntityType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Sales Contract' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'sales-contract-v2.pdf' })
  @IsString()
  @MaxLength(255, { message: 'File name must not exceed 255 characters' })
  @Matches(/^[^/\\:*?"<>|]+$/, { message: 'File name contains invalid characters' })
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType!: string;

  @ApiPropertyOptional({ example: 204800, description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeBytes?: number;

  @ApiPropertyOptional({ enum: DocumentCategory, default: 'OTHER' })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiProperty({ enum: DocumentEntityType, example: 'BOOKING' })
  @IsEnum(DocumentEntityType)
  entityType!: DocumentEntityType;

  @ApiProperty({ example: 'booking_abc123', description: 'ID of the associated entity' })
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ example: 'Signed by client on 2026-03-01' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['signed', 'v2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'https://storage.example.com/docs/contract.pdf' })
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'URL must be a valid HTTPS URL' })
  @MaxLength(2048, { message: 'URL must not exceed 2048 characters' })
  url!: string;
}
