// ============================================================
// Change Tenant Status DTO
// ============================================================

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus } from '@prisma/client';

export class ChangeTenantStatusDto {
  @ApiProperty({
    enum: TenantStatus,
    example: TenantStatus.SUSPENDED,
    description: 'New tenant status',
  })
  @IsEnum(TenantStatus, { message: 'Status must be ACTIVE, SUSPENDED, or ARCHIVED' })
  status!: TenantStatus;
}
