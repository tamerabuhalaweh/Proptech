// ============================================================
// Create Milestone DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MilestoneStatus } from '@prisma/client';

export class CreateMilestoneDto {
  @ApiProperty({ example: 'booking_abc123', description: 'Booking ID' })
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 'Down Payment' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Initial down payment for unit A-101' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000, description: 'Milestone amount' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-04-01T00:00:00Z', description: 'Due date' })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({ enum: MilestoneStatus, default: 'UPCOMING' })
  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @ApiPropertyOptional({ example: 'First installment notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
