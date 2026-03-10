// ============================================================
// Create Notification DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user_abc123', description: 'Target user ID' })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({ enum: NotificationType, default: 'INFO' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ example: 'New Booking' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'A new booking has been created for unit A-101' })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ example: '/bookings/abc123', description: 'Deep link URL' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ example: { bookingId: 'abc123' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
