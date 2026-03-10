// ============================================================
// Tenant Isolation via Prisma Client Extension
// Auto-injects tenant_id into all queries/mutations for scoped models
// ============================================================

import { PrismaClient } from '@prisma/client';

/**
 * Creates a Prisma client extension that auto-scopes User and Project
 * queries to a specific tenant.
 *
 * @param prisma - Base PrismaClient instance
 * @param tenantId - The tenant ID to scope queries to
 * @returns Extended Prisma client with tenant isolation
 */
export function withTenantScope<T extends PrismaClient>(prisma: T, tenantId: string) {
  return prisma.$extends({
    name: 'tenant-isolation',
    query: {
      user: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          (args.data as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async update({ args, query }) {
          (args.where as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async delete({ args, query }) {
          (args.where as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
      project: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          (args.data as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async update({ args, query }) {
          (args.where as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async delete({ args, query }) {
          (args.where as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
    },
  });
}

/**
 * Legacy function name — delegates to withTenantScope
 * @deprecated Use withTenantScope instead
 */
export function tenantMiddleware(prisma: PrismaClient, tenantId: string) {
  return withTenantScope(prisma, tenantId);
}
