// ============================================================
// Tenant Types
// ============================================================

import { TenantStatus } from './enums';

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  tradeLicense: string | null;
  vatNumber: string | null;
  contactEmail: string;
  country: string;
  status: TenantStatus;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ICreateTenant {
  name: string;
  slug?: string;
  tradeLicense?: string;
  vatNumber?: string;
  contactEmail: string;
  country?: string;
  config?: Record<string, unknown>;
}

export interface IUpdateTenant {
  name?: string;
  tradeLicense?: string;
  vatNumber?: string;
  contactEmail?: string;
  country?: string;
  config?: Record<string, unknown>;
}

export interface IChangeTenantStatus {
  status: TenantStatus;
}
