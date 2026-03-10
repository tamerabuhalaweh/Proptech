// ============================================================
// API Entry Point
// ============================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Security headers via Helmet
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for Swagger
    crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
  }));

  // CORS — strict origin validation
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 3600, // Cache preflight for 1 hour
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Request body size limit (10MB)
  app.use(
    (await import('express')).json({ limit: '10mb' }),
  );

  // Swagger — disabled in production by default
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Proptech API')
      .setDescription('Property Management SaaS Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT access token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Auth', 'Authentication & authorization')
      .addTag('Tenants', 'Tenant management')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log('📚 Swagger docs available at /docs');
  }

  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger UI: http://localhost:${port}/docs`);
  }
}

bootstrap();
