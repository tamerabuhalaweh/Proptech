// ============================================================
// Create Subscription DTO
// ============================================================

import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan, BillingCycle } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'tenant_abc123', description: 'Tenant ID' })
  @IsString()
  tenantId!: string;

  @ApiPropertyOptional({ enum: SubscriptionPlan, default: SubscriptionPlan.STARTER })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ description: 'Trial end date' })
  @IsOptional()
  @IsDateString()
  trialEndsAt?: string;
}
