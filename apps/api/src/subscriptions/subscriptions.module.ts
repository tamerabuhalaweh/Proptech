// ============================================================
// Subscriptions Module — Sprint 4: Billing & Limits
// ============================================================

import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionLimitGuard } from './subscription-limit.guard';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionLimitGuard],
  exports: [SubscriptionsService, SubscriptionLimitGuard],
})
export class SubscriptionsModule {}
