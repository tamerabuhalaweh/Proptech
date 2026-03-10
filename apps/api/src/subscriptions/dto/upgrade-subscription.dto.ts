// ============================================================
// Upgrade / Downgrade Subscription DTO
// ============================================================

import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, BillingCycle } from '@prisma/client';

export class UpgradeSubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlan, description: 'Target plan' })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @ApiPropertyOptional({ enum: BillingCycle })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}
