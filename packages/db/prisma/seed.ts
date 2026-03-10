// ============================================================
// Database Seed — Initial data for development
// ============================================================

import { PrismaClient, UserRole, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create platform tenant for SuperAdmin
  const platformTenant = await prisma.tenant.upsert({
    where: { slug: 'platform' },
    update: {},
    create: {
      name: 'Platform',
      slug: 'platform',
      contactEmail: 'admin@proptech.sa',
      country: 'SA',
      status: TenantStatus.ACTIVE,
    },
  });
  console.log(`✅ Platform tenant: ${platformTenant.id}`);

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Real Estate Co.',
      slug: 'demo-company',
      contactEmail: 'demo@example.com',
      tradeLicense: 'TL-12345',
      vatNumber: 'VAT-67890',
      country: 'SA',
      status: TenantStatus.ACTIVE,
    },
  });
  console.log(`✅ Demo tenant: ${demoTenant.id}`);

  // Create SuperAdmin user
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: platformTenant.id,
        email: 'admin@proptech.sa',
      },
    },
    update: {},
    create: {
      tenantId: platformTenant.id,
      email: 'admin@proptech.sa',
      passwordHash,
      displayName: 'Platform Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ SuperAdmin user: ${superAdmin.id}`);

  // Create demo TenantAdmin
  const tenantAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'admin@demo.com',
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: 'admin@demo.com',
      passwordHash,
      displayName: 'Demo Admin',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ TenantAdmin user: ${tenantAdmin.id}`);

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      tenantId: demoTenant.id,
      name: 'Al Hamra Residences',
      nameAr: 'مساكن الحمراء',
      description: 'Luxury residential development in Riyadh',
      location: 'Riyadh, Saudi Arabia',
      totalUnits: 120,
    },
  });
  console.log(`✅ Demo project: ${project.id}`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
