// ============================================================
// Send Email Template DTO
// ============================================================

import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailTemplateDto {
  @ApiProperty({ example: 'client@email.com', description: 'Recipient email' })
  @IsString()
  to!: string;

  @ApiPropertyOptional({ example: 'agent@company.com', description: 'Sender email' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({
    example: { name: 'John Doe', bookingId: 'BK-001' },
    description: 'Variables to interpolate',
  })
  @IsObject()
  variables!: Record<string, string>;

  @ApiPropertyOptional({ example: 'lead_abc123' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ example: 'booking_abc123' })
  @IsOptional()
  @IsString()
  bookingId?: string;
}
