// ============================================================
// Preview Email Template DTO
// ============================================================

import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PreviewEmailTemplateDto {
  @ApiProperty({
    example: { name: 'John Doe', bookingId: 'BK-001', unitNumber: 'A-101' },
    description: 'Variables to interpolate into the template',
  })
  @IsObject()
  variables!: Record<string, string>;
}
