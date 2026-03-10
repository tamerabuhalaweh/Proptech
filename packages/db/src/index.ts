// ============================================================
// @proptech/db — Database client & utilities
// ============================================================

export { PrismaClient } from '@prisma/client';
export type {
  Tenant,
  User,
  Project,
  TenantStatus,
  UserRole,
  ProjectStatus,
} from '@prisma/client';

export { createPrismaClient } from './client';
export { withTenantScope, tenantMiddleware } from './middleware/tenant-middleware';
