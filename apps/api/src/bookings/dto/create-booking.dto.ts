// ============================================================
// Create Booking DTO
// ============================================================

import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'unit_abc123', description: 'Unit ID to book' })
  @IsString()
  unitId!: string;

  @ApiPropertyOptional({ example: 'lead_abc123', description: 'Associated lead ID' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ example: 750000, description: 'Total booking price' })
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @ApiPropertyOptional({ example: 50000, description: 'Down payment amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiPropertyOptional({
    example: { installments: 12, monthlyAmount: 58333 },
    description: 'Payment plan details',
  })
  @IsOptional()
  @IsObject()
  paymentPlan?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-04-15T00:00:00Z', description: 'Booking expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: ['contract.pdf'], description: 'Attached document URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiPropertyOptional({ example: 'VIP client, priority booking', description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
