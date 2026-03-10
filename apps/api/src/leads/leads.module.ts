// ============================================================
// Leads Module — Sprint 3: Leads CRM + Sprint 4: Duplicate Detection & Expiry
// ============================================================

import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { ActivitiesService } from './activities.service';
import { LeadActivitiesController, UserActivitiesController } from './activities.controller';
import { ScoringService } from './scoring.service';
import { PipelineService } from './pipeline.service';
import { AssignmentService } from './assignment.service';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { LeadExpiryService } from './lead-expiry.service';

@Module({
  controllers: [
    LeadsController,
    LeadActivitiesController,
    UserActivitiesController,
  ],
  providers: [
    LeadsService,
    ActivitiesService,
    ScoringService,
    PipelineService,
    AssignmentService,
    DuplicateDetectionService,
    LeadExpiryService,
  ],
  exports: [LeadsService, ActivitiesService, ScoringService, DuplicateDetectionService, LeadExpiryService],
})
export class LeadsModule {}
