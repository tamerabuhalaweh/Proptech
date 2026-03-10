// ============================================================
// Units Module
// ============================================================

import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController, BuildingUnitsController } from './units.controller';

@Module({
  controllers: [UnitsController, BuildingUnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
