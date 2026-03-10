// ============================================================
// Locale Module — Sprint 4: Localization Backend
// ============================================================

import { Module } from '@nestjs/common';
import { LocaleService } from './locale.service';
import { LocaleController } from './locale.controller';

@Module({
  controllers: [LocaleController],
  providers: [LocaleService],
  exports: [LocaleService],
})
export class LocaleModule {}
