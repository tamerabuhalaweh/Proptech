// ============================================================
// Create Communication DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
} from '@prisma/client';

export class CreateCommunicationDto {
  @ApiProperty({ enum: CommunicationType, example: 'EMAIL' })
  @IsEnum(CommunicationType)
  type!: CommunicationType;

  @ApiProperty({ enum: CommunicationDirection, example: 'OUTBOUND' })
  @IsEnum(CommunicationDirection)
  direction!: CommunicationDirection;

  @ApiPropertyOptional({ example: 'lead_abc123', description: 'Associated lead ID' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ example: 'booking_abc123', description: 'Associated booking ID' })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ example: 'Follow-up on property viewing' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Dear client, thank you for visiting...' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ example: 'agent@company.com' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: 'client@email.com' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: CommunicationStatus, default: 'PENDING' })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @ApiPropertyOptional({ example: '2026-03-11T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional({ example: { channel: 'whatsapp', templateId: 'tpl1' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
