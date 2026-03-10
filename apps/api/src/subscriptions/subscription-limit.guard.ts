// ============================================================
// Subscription Limit Guard — Enforce plan limits
// ============================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from './subscriptions.service';

export const LIMIT_RESOURCE_KEY = 'limit_resource';
export const CheckLimit = (resource: 'properties' | 'units' | 'users') =>
  SetMetadata(LIMIT_RESOURCE_KEY, resource);

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(LIMIT_RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!resource) {
      return true; // no limit check configured
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      return true; // no tenant context
    }

    const allowed = await this.subscriptionsService.checkLimit(
      user.tenantId,
      resource as 'properties' | 'units' | 'users',
    );

    if (!allowed) {
      throw new ForbiddenException(
        `Subscription limit reached for ${resource}. Please upgrade your plan.`,
      );
    }

    return true;
  }
}
