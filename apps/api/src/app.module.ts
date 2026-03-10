// ============================================================
// Root Application Module
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { HealthModule } from './health/health.module';
import { ActivityModule } from './activity/activity.module';
import { PropertiesModule } from './properties/properties.module';
import { BuildingsModule } from './buildings/buildings.module';
import { UnitsModule } from './units/units.module';
import { PricingModule } from './pricing/pricing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LeadsModule } from './leads/leads.module';
import { BookingsModule } from './bookings/bookings.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LocaleModule } from './locale/locale.module';
import { CommunicationsModule } from './communications/communications.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MilestonesModule } from './milestones/milestones.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // Configuration — loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    // Database
    PrismaModule,

    // Shared modules
    ActivityModule,

    // Sprint 1 modules
    AuthModule,
    TenantsModule,
    HealthModule,

    // Sprint 2 modules
    PropertiesModule,
    BuildingsModule,
    UnitsModule,
    PricingModule,
    DashboardModule,

    // Sprint 3 modules
    LeadsModule,

    // Sprint 4 modules
    BookingsModule,
    SubscriptionsModule,
    CampaignsModule,
    LocaleModule,

    // Sprint 5 modules
    CommunicationsModule,
    EmailTemplatesModule,
    DocumentsModule,
    NotificationsModule,
    MilestonesModule,
  ],
  providers: [
    // Global exception filter — structured error responses
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global logging interceptor — logs all requests
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global JWT guard — all routes require auth by default
    // Use @Public() decorator to skip
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
