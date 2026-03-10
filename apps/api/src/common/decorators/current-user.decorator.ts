// ============================================================
// @CurrentUser() Decorator — Extracts user from JWT request
// ============================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtUser {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext): JwtUser | string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtUser;

    if (data) {
      return user[data];
    }

    return user;
  },
);
