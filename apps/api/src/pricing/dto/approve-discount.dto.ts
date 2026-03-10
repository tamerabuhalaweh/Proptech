// ============================================================
// Approve/Reject Discount DTO
// ============================================================

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DiscountStatus } from '@prisma/client';

export class ApproveDiscountDto {
  @ApiProperty({ enum: [DiscountStatus.APPROVED, DiscountStatus.REJECTED], description: 'Decision' })
  @IsEnum(DiscountStatus)
  status!: DiscountStatus;
}
