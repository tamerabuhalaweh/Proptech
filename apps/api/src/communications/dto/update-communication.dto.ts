// ============================================================
// Update Communication DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationStatus } from '@prisma/client';

export class UpdateCommunicationDto {
  @ApiPropertyOptional({ example: 'Updated subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Updated body' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ enum: CommunicationStatus })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @ApiPropertyOptional({ example: '2026-03-11T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional({ example: '2026-03-11T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  readAt?: string;

  @ApiPropertyOptional({ example: { deliveryId: 'xyz' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
