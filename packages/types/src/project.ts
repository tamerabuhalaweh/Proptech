// ============================================================
// Project Types
// ============================================================

import { ProjectStatus } from './enums';

export interface IProject {
  id: string;
  tenantId: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  status: ProjectStatus;
  location: string | null;
  totalUnits: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
