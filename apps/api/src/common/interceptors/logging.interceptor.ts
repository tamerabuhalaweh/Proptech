// ============================================================
// Global Logging Interceptor
// Logs every request: method, URL, status code, duration
// ============================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

/** Paths that may contain sensitive data — never log request bodies for these */
const SENSITIVE_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '-';
    const startTime = Date.now();

    // SECURITY: Never log request bodies for sensitive endpoints
    const isSensitive = SENSITIVE_PATHS.some((p) => originalUrl.includes(p));
    if (!isSensitive && process.env.NODE_ENV === 'development' && request.body) {
      // Even in dev, redact password fields from logged bodies
      const sanitizedBody = { ...request.body };
      if ('password' in sanitizedBody) sanitizedBody.password = '[REDACTED]';
      if ('passwordHash' in sanitizedBody) sanitizedBody.passwordHash = '[REDACTED]';
      if ('refreshToken' in sanitizedBody) sanitizedBody.refreshToken = '[REDACTED]';
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<Response>();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.log(
            `${method} ${originalUrl} ${statusCode} ${duration}ms — ${ip} "${userAgent}"`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const status = error?.status || error?.getStatus?.() || 500;

          this.logger.warn(
            `${method} ${originalUrl} ${status} ${duration}ms — ${ip} "${userAgent}" — ${error.message}`,
          );
        },
      }),
    );
  }
}
