// ============================================================
// Cancel Booking DTO
// ============================================================

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 'Client withdrew from purchase', description: 'Cancellation reason' })
  @IsString()
  @MinLength(3)
  reason!: string;
}
