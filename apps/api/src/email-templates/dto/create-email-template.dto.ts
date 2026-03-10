// ============================================================
// Create Email Template DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailTemplateCategory } from '@prisma/client';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'Booking Confirmation' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Your booking {{bookingId}} is confirmed' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: '<h1>Hello {{name}}</h1><p>Your booking is confirmed.</p>' })
  @IsString()
  bodyHtml!: string;

  @ApiPropertyOptional({ example: 'Hello {{name}}, your booking is confirmed.' })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional({ enum: EmailTemplateCategory, default: 'CUSTOM' })
  @IsOptional()
  @IsEnum(EmailTemplateCategory)
  category?: EmailTemplateCategory;

  @ApiPropertyOptional({
    example: ['name', 'bookingId', 'unitNumber'],
    description: 'Variable names used in the template',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
