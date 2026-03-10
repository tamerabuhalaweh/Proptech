// ============================================================
// Database Seed — Comprehensive development data
// Realistic Saudi/MENA property management sample data
// ============================================================

import {
  PrismaClient,
  UserRole,
  TenantStatus,
  PropertyType,
  ProjectStatus,
  UnitType,
  UnitStatus,
  LeadSource,
  LeadStage,
  ActivityType,
  BookingStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
  EmailTemplateCategory,
  DocumentCategory,
  DocumentEntityType,
  NotificationType,
  MilestoneStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database with comprehensive Saudi/MENA data...\n');

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // ============================================================
  // 1. TENANTS
  // ============================================================
  console.log('📋 Creating tenants...');

  const tenantAr = await prisma.tenant.upsert({
    where: { slug: 'dar-al-arkan' },
    update: {},
    create: {
      name: 'دار الأركان للتطوير العقاري',
      slug: 'dar-al-arkan',
      tradeLicense: 'TL-1010234567',
      vatNumber: '300456789012345',
      contactEmail: 'info@dar-alarkan.sa',
      country: 'SA',
      status: TenantStatus.ACTIVE,
      config: JSON.stringify({
        language: 'ar',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
      }),
    },
  });
  console.log(`  ✅ Tenant (Arabic): ${tenantAr.name}`);

  const tenantEn = await prisma.tenant.upsert({
    where: { slug: 'gulf-properties' },
    update: {},
    create: {
      name: 'Gulf Properties International',
      slug: 'gulf-properties',
      tradeLicense: 'TL-4030567890',
      vatNumber: '300789012345678',
      contactEmail: 'info@gulfproperties.com',
      country: 'SA',
      status: TenantStatus.ACTIVE,
      config: JSON.stringify({
        language: 'en',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
      }),
    },
  });
  console.log(`  ✅ Tenant (English): ${tenantEn.name}`);

  // ============================================================
  // 2. USERS
  // ============================================================
  console.log('\n👥 Creating users...');

  // ---- Arabic Tenant Users ----
  const adminAr = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantAr.id, email: 'admin@dar-alarkan.sa' } },
    update: {},
    create: {
      tenantId: tenantAr.id,
      email: 'admin@dar-alarkan.sa',
      passwordHash,
      displayName: 'عبدالله المطيري',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✅ Admin (AR): ${adminAr.displayName}`);

  const managerAr = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantAr.id, email: 'manager@dar-alarkan.sa' } },
    update: {},
    create: {
      tenantId: tenantAr.id,
      email: 'manager@dar-alarkan.sa',
      passwordHash,
      displayName: 'محمد الغامدي',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });
  console.log(`  ✅ Manager (AR): ${managerAr.displayName}`);

  const brokerAr = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantAr.id, email: 'broker@dar-alarkan.sa' } },
    update: {},
    create: {
      tenantId: tenantAr.id,
      email: 'broker@dar-alarkan.sa',
      passwordHash,
      displayName: 'فهد القحطاني',
      role: UserRole.BROKER,
      isActive: true,
    },
  });
  console.log(`  ✅ Broker (AR): ${brokerAr.displayName}`);

  // ---- English Tenant Users ----
  const adminEn = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantEn.id, email: 'admin@gulfproperties.com' } },
    update: {},
    create: {
      tenantId: tenantEn.id,
      email: 'admin@gulfproperties.com',
      passwordHash,
      displayName: 'Sarah Thompson',
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✅ Admin (EN): ${adminEn.displayName}`);

  const managerEn = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantEn.id, email: 'manager@gulfproperties.com' } },
    update: {},
    create: {
      tenantId: tenantEn.id,
      email: 'manager@gulfproperties.com',
      passwordHash,
      displayName: 'Ahmed Khalil',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });
  console.log(`  ✅ Manager (EN): ${managerEn.displayName}`);

  const brokerEn = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantEn.id, email: 'broker@gulfproperties.com' } },
    update: {},
    create: {
      tenantId: tenantEn.id,
      email: 'broker@gulfproperties.com',
      passwordHash,
      displayName: 'Khaled Mansour',
      role: UserRole.BROKER,
      isActive: true,
    },
  });
  console.log(`  ✅ Broker (EN): ${brokerEn.displayName}`);

  // ============================================================
  // 3. LOCALE SETTINGS
  // ============================================================
  console.log('\n🌍 Creating locale settings...');

  await prisma.localeSettings.upsert({
    where: { tenantId: tenantAr.id },
    update: {},
    create: {
      tenantId: tenantAr.id,
      language: 'ar',
      calendarType: 'hijri',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      firstDayOfWeek: 0, // Sunday
      numberFormat: 'ar-SA',
    },
  });

  await prisma.localeSettings.upsert({
    where: { tenantId: tenantEn.id },
    update: {},
    create: {
      tenantId: tenantEn.id,
      language: 'en',
      calendarType: 'gregorian',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      firstDayOfWeek: 0,
      numberFormat: 'en-SA',
    },
  });
  console.log('  ✅ Locale settings created');

  // ============================================================
  // 4. SUBSCRIPTIONS
  // ============================================================
  console.log('\n💳 Creating subscriptions...');

  await prisma.subscription.upsert({
    where: { tenantId: tenantAr.id },
    update: {},
    create: {
      tenantId: tenantAr.id,
      plan: SubscriptionPlan.ENTERPRISE,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.ANNUAL,
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2025-01-01'),
      maxProperties: 50,
      maxUnits: 1000,
      maxUsers: 25,
      storageGB: 50,
    },
  });

  await prisma.subscription.upsert({
    where: { tenantId: tenantEn.id },
    update: {},
    create: {
      tenantId: tenantEn.id,
      plan: SubscriptionPlan.PROFESSIONAL,
      status: SubscriptionStatus.ACTIVE,
      billingCycle: BillingCycle.MONTHLY,
      currentPeriodStart: new Date('2024-11-01'),
      currentPeriodEnd: new Date('2024-12-01'),
      maxProperties: 20,
      maxUnits: 500,
      maxUsers: 10,
      storageGB: 10,
    },
  });
  console.log('  ✅ Subscriptions created');

  // ============================================================
  // 5. PROPERTIES & BUILDINGS & UNITS
  // ============================================================
  console.log('\n🏢 Creating properties, buildings, and units...');

  // ---- Arabic Tenant: Property 1 ----
  const prop1 = await prisma.property.create({
    data: {
      tenantId: tenantAr.id,
      name: 'أبراج الرياض',
      nameAr: 'أبراج الرياض',
      description: 'Luxury residential towers in the heart of Riyadh',
      descriptionAr: 'أبراج سكنية فاخرة في قلب الرياض',
      type: PropertyType.RESIDENTIAL,
      status: ProjectStatus.ACTIVE,
      location: 'طريق الملك فهد، حي العليا',
      city: 'الرياض',
      totalUnits: 60,
      amenities: ['مسبح', 'صالة رياضة', 'مواقف سيارات', 'حراسة أمنية', 'حدائق'],
    },
  });

  const building1A = await prisma.building.create({
    data: {
      tenantId: tenantAr.id,
      propertyId: prop1.id,
      name: 'البرج الشمالي',
      nameAr: 'البرج الشمالي',
      totalFloors: 15,
      totalUnits: 30,
      status: ProjectStatus.ACTIVE,
    },
  });

  const building1B = await prisma.building.create({
    data: {
      tenantId: tenantAr.id,
      propertyId: prop1.id,
      name: 'البرج الجنوبي',
      nameAr: 'البرج الجنوبي',
      totalFloors: 15,
      totalUnits: 30,
      status: ProjectStatus.ACTIVE,
    },
  });

  // Create units for building 1A
  const unitTypes: UnitType[] = [UnitType.STUDIO, UnitType.ONE_BR, UnitType.TWO_BR, UnitType.THREE_BR, UnitType.PENTHOUSE];
  const unitStatuses: UnitStatus[] = [UnitStatus.AVAILABLE, UnitStatus.RESERVED, UnitStatus.SOLD, UnitStatus.AVAILABLE, UnitStatus.AVAILABLE];
  const unitPrices = [450000, 750000, 1200000, 1800000, 3500000];
  const unitAreas = [45, 75, 120, 180, 350];

  const createdUnits: string[] = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const idx = (floor + unit) % unitTypes.length;
      const u = await prisma.unit.create({
        data: {
          tenantId: tenantAr.id,
          buildingId: building1A.id,
          unitNumber: `${floor}0${unit}`,
          floor,
          type: unitTypes[idx],
          area: unitAreas[idx],
          status: unitStatuses[idx],
          basePrice: unitPrices[idx],
          view: floor > 3 ? 'City View' : 'Garden View',
          features: ['تكييف مركزي', 'مطبخ مجهز'],
        },
      });
      createdUnits.push(u.id);
    }
  }

  // Create a few units for building 1B
  for (let floor = 1; floor <= 3; floor++) {
    for (let unit = 1; unit <= 3; unit++) {
      const idx = (floor + unit) % unitTypes.length;
      await prisma.unit.create({
        data: {
          tenantId: tenantAr.id,
          buildingId: building1B.id,
          unitNumber: `${floor}0${unit}`,
          floor,
          type: unitTypes[idx],
          area: unitAreas[idx],
          status: UnitStatus.AVAILABLE,
          basePrice: unitPrices[idx] * 1.1,
          view: 'Park View',
          features: ['تكييف مركزي', 'شرفة واسعة'],
        },
      });
    }
  }

  console.log(`  ✅ Property: ${prop1.name} (${building1A.name}, ${building1B.name})`);

  // ---- English Tenant: Property 2 ----
  const prop2 = await prisma.property.create({
    data: {
      tenantId: tenantEn.id,
      name: 'Jeddah Waterfront Residences',
      nameAr: 'واجهة جدة البحرية',
      description: 'Premium waterfront apartments with stunning Red Sea views',
      descriptionAr: 'شقق فاخرة على الواجهة البحرية مع إطلالات خلابة على البحر الأحمر',
      type: PropertyType.RESIDENTIAL,
      status: ProjectStatus.ACTIVE,
      location: 'Corniche Road, Al Shati District',
      city: 'Jeddah',
      totalUnits: 40,
      amenities: ['Pool', 'Gym', 'Beach Access', 'Concierge', 'Spa'],
    },
  });

  const building2A = await prisma.building.create({
    data: {
      tenantId: tenantEn.id,
      propertyId: prop2.id,
      name: 'Sea Tower',
      nameAr: 'برج البحر',
      totalFloors: 20,
      totalUnits: 40,
      status: ProjectStatus.ACTIVE,
    },
  });

  const enUnits: string[] = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const idx = (floor + unit) % unitTypes.length;
      const u = await prisma.unit.create({
        data: {
          tenantId: tenantEn.id,
          buildingId: building2A.id,
          unitNumber: `${floor}0${unit}`,
          floor,
          type: unitTypes[idx],
          area: unitAreas[idx] * 1.2,
          status: unit === 1 ? UnitStatus.SOLD : UnitStatus.AVAILABLE,
          basePrice: unitPrices[idx] * 1.5,
          view: floor > 3 ? 'Sea View' : 'City View',
          features: ['Central AC', 'Smart Home', 'Italian Kitchen'],
        },
      });
      enUnits.push(u.id);
    }
  }
  console.log(`  ✅ Property: ${prop2.name} (${building2A.name})`);

  // ---- English Tenant: Commercial Property ----
  const prop3 = await prisma.property.create({
    data: {
      tenantId: tenantEn.id,
      name: 'KAFD Business Hub',
      nameAr: 'مركز كافد للأعمال',
      description: 'Grade A office spaces in King Abdullah Financial District',
      type: PropertyType.COMMERCIAL,
      status: ProjectStatus.ACTIVE,
      location: 'KAFD, Riyadh',
      city: 'Riyadh',
      totalUnits: 25,
      amenities: ['Meeting Rooms', 'Parking', 'Security', 'Cafeteria', 'Helipad'],
    },
  });

  const building3A = await prisma.building.create({
    data: {
      tenantId: tenantEn.id,
      propertyId: prop3.id,
      name: 'Tower One',
      totalFloors: 30,
      totalUnits: 25,
      status: ProjectStatus.ACTIVE,
    },
  });

  for (let floor = 1; floor <= 5; floor++) {
    await prisma.unit.create({
      data: {
        tenantId: tenantEn.id,
        buildingId: building3A.id,
        unitNumber: `OFF-${floor}01`,
        floor,
        type: UnitType.OFFICE,
        area: 250 + floor * 50,
        status: UnitStatus.AVAILABLE,
        basePrice: 2500000 + floor * 500000,
        view: 'City Skyline',
        features: ['Fiber Optic', 'Raised Floor', 'Dedicated HVAC'],
      },
    });
  }
  console.log(`  ✅ Property: ${prop3.name}`);

  // ============================================================
  // 6. LEADS
  // ============================================================
  console.log('\n📞 Creating leads...');

  const arabicLeads = [
    { name: 'خالد بن سعود العتيبي', email: 'khalid.otaibi@gmail.com', phone: '+966501234567', source: LeadSource.WEBSITE, stage: LeadStage.NEW, score: 45 },
    { name: 'نورة بنت محمد الشمري', email: 'noura.shamri@outlook.sa', phone: '+966559876543', source: LeadSource.WHATSAPP, stage: LeadStage.CONTACTED, score: 62 },
    { name: 'عبدالرحمن الدوسري', email: 'abdulrahman.dosari@yahoo.com', phone: '+966541112233', source: LeadSource.REFERRAL, stage: LeadStage.QUALIFIED, score: 78 },
    { name: 'فاطمة الزهراء العلي', email: 'fatima.ali@hotmail.com', phone: '+966532223344', source: LeadSource.WALK_IN, stage: LeadStage.PROPOSAL, score: 85 },
    { name: 'سلطان العنزي', email: 'sultan.anazi@gmail.com', phone: '+966523334455', source: LeadSource.SOCIAL, stage: LeadStage.NEGOTIATION, score: 92 },
    { name: 'هند بنت فيصل', email: 'hind.faisal@gmail.com', phone: '+966514445566', source: LeadSource.PHONE, stage: LeadStage.WON, score: 100 },
    { name: 'تركي المالكي', email: 'turki.malki@outlook.sa', phone: '+966505556677', source: LeadSource.EMAIL, stage: LeadStage.LOST, score: 30 },
  ];

  const createdLeads: string[] = [];
  for (const lead of arabicLeads) {
    const l = await prisma.lead.create({
      data: {
        tenantId: tenantAr.id,
        ...lead,
        assignedTo: lead.stage === LeadStage.NEW ? null : brokerAr.id,
        propertyId: prop1.id,
        budget: 800000,
        budgetMax: 2000000,
        unitPreferences: JSON.stringify({ type: 'TWO_BR', minArea: 100 }),
        tags: ['VIP', 'عميل محتمل'],
        lastContactedAt: lead.stage !== LeadStage.NEW ? new Date() : null,
        wonAt: lead.stage === LeadStage.WON ? new Date() : null,
        lostAt: lead.stage === LeadStage.LOST ? new Date() : null,
        lostReason: lead.stage === LeadStage.LOST ? 'وجد عرض أفضل' : null,
      },
    });
    createdLeads.push(l.id);
  }

  const englishLeads = [
    { name: 'John Anderson', email: 'john.anderson@expat.com', phone: '+966501112233', source: LeadSource.WEBSITE, stage: LeadStage.QUALIFIED, score: 70 },
    { name: 'Maria Santos', email: 'maria.santos@company.com', phone: '+966559998877', source: LeadSource.REFERRAL, stage: LeadStage.PROPOSAL, score: 80 },
    { name: 'Omar Hassan', email: 'omar.hassan@business.sa', phone: '+966547776655', source: LeadSource.WALK_IN, stage: LeadStage.NEGOTIATION, score: 88 },
  ];

  for (const lead of englishLeads) {
    const l = await prisma.lead.create({
      data: {
        tenantId: tenantEn.id,
        ...lead,
        assignedTo: brokerEn.id,
        propertyId: prop2.id,
        budget: 1500000,
        budgetMax: 3000000,
        unitPreferences: JSON.stringify({ type: 'THREE_BR', view: 'Sea View' }),
        tags: ['Expat', 'High Budget'],
      },
    });
    createdLeads.push(l.id);
  }
  console.log(`  ✅ Created ${arabicLeads.length + englishLeads.length} leads`);

  // ============================================================
  // 7. LEAD ACTIVITIES
  // ============================================================
  console.log('\n📝 Creating lead activities...');

  if (createdLeads.length >= 3) {
    const activities = [
      { leadId: createdLeads[1], type: ActivityType.WHATSAPP, title: 'رسالة واتساب أولية', description: 'تم إرسال معلومات المشروع عبر الواتساب', performedBy: brokerAr.id },
      { leadId: createdLeads[2], type: ActivityType.CALL, title: 'مكالمة تأهيل', description: 'تم التحقق من الميزانية والاحتياجات', performedBy: brokerAr.id },
      { leadId: createdLeads[2], type: ActivityType.SITE_VISIT, title: 'زيارة موقع المشروع', description: 'جولة في الشقق النموذجية', performedBy: brokerAr.id, scheduledAt: new Date(Date.now() + 86400000) },
      { leadId: createdLeads[3], type: ActivityType.MEETING, title: 'اجتماع عرض السعر', description: 'تقديم عرض سعر مفصل مع خطة الدفع', performedBy: managerAr.id },
      { leadId: createdLeads[4], type: ActivityType.NOTE, title: 'ملاحظة تفاوض', description: 'العميل يطلب خصم 5% — بانتظار موافقة الإدارة', performedBy: brokerAr.id },
    ];

    for (const activity of activities) {
      await prisma.leadActivity.create({
        data: {
          tenantId: tenantAr.id,
          ...activity,
        },
      });
    }
    console.log(`  ✅ Created ${activities.length} lead activities`);
  }

  // ============================================================
  // 8. BOOKINGS
  // ============================================================
  console.log('\n📋 Creating bookings...');

  if (createdUnits.length >= 3 && createdLeads.length >= 5) {
    const booking1 = await prisma.booking.create({
      data: {
        tenantId: tenantAr.id,
        unitId: createdUnits[0],
        leadId: createdLeads[5], // Won lead
        status: BookingStatus.CONFIRMED,
        totalPrice: 1200000,
        downPayment: 240000,
        paymentPlan: JSON.stringify({ type: 'installment', months: 24, monthlyAmount: 40000 }),
        confirmedAt: new Date(),
        createdBy: brokerAr.id,
        notes: 'عميل VIP — خطة دفع مخصصة',
      },
    });

    await prisma.booking.create({
      data: {
        tenantId: tenantAr.id,
        unitId: createdUnits[2],
        leadId: createdLeads[4], // Negotiation lead
        status: BookingStatus.PENDING,
        totalPrice: 1800000,
        downPayment: 360000,
        paymentPlan: JSON.stringify({ type: 'installment', months: 36, monthlyAmount: 40000 }),
        expiryDate: new Date(Date.now() + 7 * 86400000),
        createdBy: brokerAr.id,
      },
    });

    console.log('  ✅ Created 2 bookings');

    // ============================================================
    // 9. MILESTONES
    // ============================================================
    console.log('\n💰 Creating milestones...');

    const milestones = [
      { name: 'دفعة مقدمة (20%)', amount: 240000, dueDate: new Date('2024-01-15'), status: MilestoneStatus.PAID, paidDate: new Date('2024-01-15'), paymentMethod: 'bank_transfer', receiptNumber: 'RCP-2024-001' },
      { name: 'قسط شهر فبراير', amount: 40000, dueDate: new Date('2024-02-15'), status: MilestoneStatus.PAID, paidDate: new Date('2024-02-14'), paymentMethod: 'bank_transfer', receiptNumber: 'RCP-2024-002' },
      { name: 'قسط شهر مارس', amount: 40000, dueDate: new Date('2024-03-15'), status: MilestoneStatus.PAID, paidDate: new Date('2024-03-15'), paymentMethod: 'credit_card', receiptNumber: 'RCP-2024-003' },
      { name: 'قسط شهر أبريل', amount: 40000, dueDate: new Date('2024-04-15'), status: MilestoneStatus.DUE },
      { name: 'قسط شهر مايو', amount: 40000, dueDate: new Date('2024-05-15'), status: MilestoneStatus.UPCOMING },
      { name: 'قسط شهر يونيو', amount: 40000, dueDate: new Date('2024-06-15'), status: MilestoneStatus.UPCOMING },
      { name: 'دفعة نهائية عند التسليم', amount: 520000, dueDate: new Date('2025-12-31'), status: MilestoneStatus.UPCOMING, description: 'الدفعة الأخيرة عند استلام الوحدة' },
    ];

    for (const ms of milestones) {
      await prisma.milestone.create({
        data: {
          tenantId: tenantAr.id,
          bookingId: booking1.id,
          ...ms,
        },
      });
    }
    console.log(`  ✅ Created ${milestones.length} milestones`);
  }

  // ============================================================
  // 10. COMMUNICATIONS
  // ============================================================
  console.log('\n💬 Creating communications...');

  const communications = [
    {
      tenantId: tenantAr.id,
      leadId: createdLeads[1],
      type: CommunicationType.WHATSAPP,
      direction: CommunicationDirection.OUTBOUND,
      subject: null,
      body: 'السلام عليكم، مرفق لكم تفاصيل مشروع أبراج الرياض',
      from: '+966501234567',
      to: '+966559876543',
      status: CommunicationStatus.DELIVERED,
      sentAt: new Date(),
    },
    {
      tenantId: tenantAr.id,
      leadId: createdLeads[2],
      type: CommunicationType.EMAIL,
      direction: CommunicationDirection.OUTBOUND,
      subject: 'عرض سعر — شقة غرفتين نوم',
      body: 'مرحباً، يسعدنا تقديم عرض السعر المرفق لشقة غرفتين نوم...',
      from: 'sales@dar-alarkan.sa',
      to: 'abdulrahman.dosari@yahoo.com',
      status: CommunicationStatus.READ,
      sentAt: new Date(Date.now() - 86400000),
    },
    {
      tenantId: tenantEn.id,
      leadId: createdLeads[7],
      type: CommunicationType.EMAIL,
      direction: CommunicationDirection.OUTBOUND,
      subject: 'Jeddah Waterfront — Unit Price Quotation',
      body: 'Dear John, please find attached the price quotation for the 3BR sea-view apartment...',
      from: 'sales@gulfproperties.com',
      to: 'john.anderson@expat.com',
      status: CommunicationStatus.SENT,
      sentAt: new Date(),
    },
  ];

  for (const comm of communications) {
    await prisma.communication.create({ data: comm });
  }
  console.log(`  ✅ Created ${communications.length} communications`);

  // ============================================================
  // 11. EMAIL TEMPLATES
  // ============================================================
  console.log('\n📧 Creating email templates...');

  await prisma.emailTemplate.upsert({
    where: { tenantId_name: { tenantId: tenantAr.id, name: 'booking-confirmation-ar' } },
    update: {},
    create: {
      tenantId: tenantAr.id,
      name: 'booking-confirmation-ar',
      subject: 'تأكيد الحجز — {{propertyName}}',
      bodyHtml: '<div dir="rtl"><h2>مرحباً {{customerName}}</h2><p>نؤكد لكم حجز الوحدة {{unitNumber}} في {{propertyName}}.</p><p>المبلغ الإجمالي: {{totalPrice}} ر.س</p></div>',
      bodyText: 'مرحباً {{customerName}}، نؤكد لكم حجز الوحدة {{unitNumber}} في {{propertyName}}.',
      category: EmailTemplateCategory.BOOKING_CONFIRMATION,
      variables: JSON.stringify(['customerName', 'unitNumber', 'propertyName', 'totalPrice']),
      isDefault: true,
    },
  });

  await prisma.emailTemplate.upsert({
    where: { tenantId_name: { tenantId: tenantEn.id, name: 'welcome-email' } },
    update: {},
    create: {
      tenantId: tenantEn.id,
      name: 'welcome-email',
      subject: 'Welcome to {{appName}}!',
      bodyHtml: '<h2>Welcome, {{customerName}}!</h2><p>Thank you for your interest in our properties. Your dedicated agent {{agentName}} will be in touch shortly.</p>',
      bodyText: 'Welcome, {{customerName}}! Thank you for your interest in our properties.',
      category: EmailTemplateCategory.WELCOME,
      variables: JSON.stringify(['customerName', 'appName', 'agentName']),
      isDefault: true,
    },
  });

  await prisma.emailTemplate.upsert({
    where: { tenantId_name: { tenantId: tenantAr.id, name: 'payment-reminder-ar' } },
    update: {},
    create: {
      tenantId: tenantAr.id,
      name: 'payment-reminder-ar',
      subject: 'تذكير بالدفعة المستحقة — {{milestoneName}}',
      bodyHtml: '<div dir="rtl"><h2>تذكير بالدفعة</h2><p>السيد/ة {{customerName}}</p><p>نذكركم بأن دفعة {{milestoneName}} بمبلغ {{amount}} ر.س مستحقة بتاريخ {{dueDate}}.</p></div>',
      category: EmailTemplateCategory.PAYMENT_REMINDER,
      variables: JSON.stringify(['customerName', 'milestoneName', 'amount', 'dueDate']),
    },
  });
  console.log('  ✅ Created 3 email templates');

  // ============================================================
  // 12. DOCUMENTS
  // ============================================================
  console.log('\n📄 Creating documents...');

  const documents = [
    {
      tenantId: tenantAr.id,
      name: 'عقد بيع — وحدة 101',
      fileName: 'sale-contract-101.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2457600,
      category: DocumentCategory.CONTRACT,
      entityType: DocumentEntityType.UNIT,
      entityId: createdUnits[0],
      uploadedBy: managerAr.id,
      description: 'عقد بيع الوحدة 101 في البرج الشمالي',
      tags: ['عقد', 'بيع'],
      url: '/uploads/contracts/sale-contract-101.pdf',
    },
    {
      tenantId: tenantAr.id,
      name: 'مخطط الطابق الأول',
      fileName: 'floor-plan-1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1536000,
      category: DocumentCategory.FLOOR_PLAN,
      entityType: DocumentEntityType.PROPERTY,
      entityId: prop1.id,
      uploadedBy: adminAr.id,
      description: 'مخطط الطابق الأول — البرج الشمالي',
      tags: ['مخطط', 'طابق'],
      url: '/uploads/plans/floor-plan-1.pdf',
    },
    {
      tenantId: tenantEn.id,
      name: 'Property Brochure',
      fileName: 'jeddah-waterfront-brochure.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 5120000,
      category: DocumentCategory.OTHER,
      entityType: DocumentEntityType.PROPERTY,
      entityId: prop2.id,
      uploadedBy: adminEn.id,
      description: 'Marketing brochure for Jeddah Waterfront Residences',
      tags: ['brochure', 'marketing'],
      url: '/uploads/brochures/jeddah-waterfront-brochure.pdf',
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({ data: doc });
  }
  console.log(`  ✅ Created ${documents.length} documents`);

  // ============================================================
  // 13. NOTIFICATIONS
  // ============================================================
  console.log('\n🔔 Creating notifications...');

  const notifications = [
    { tenantId: tenantAr.id, userId: adminAr.id, type: NotificationType.SUCCESS, title: 'حجز جديد', message: 'تم تأكيد حجز الوحدة 101 بنجاح', link: '/bookings' },
    { tenantId: tenantAr.id, userId: brokerAr.id, type: NotificationType.INFO, title: 'عميل محتمل جديد', message: 'تم تعيين عميل محتمل جديد لك: خالد بن سعود', link: '/leads' },
    { tenantId: tenantAr.id, userId: managerAr.id, type: NotificationType.WARNING, title: 'دفعة مستحقة', message: 'يوجد قسط مستحق بقيمة 40,000 ر.س', link: '/bookings' },
    { tenantId: tenantAr.id, userId: adminAr.id, type: NotificationType.REMINDER, title: 'تذكير: اجتماع أسبوعي', message: 'اجتماع مراجعة المبيعات الأسبوعي غداً الساعة 10:00 صباحاً' },
    { tenantId: tenantEn.id, userId: adminEn.id, type: NotificationType.INFO, title: 'New Lead Assigned', message: 'John Anderson has been assigned to Khaled Mansour', link: '/leads' },
    { tenantId: tenantEn.id, userId: brokerEn.id, type: NotificationType.SUCCESS, title: 'Site Visit Completed', message: 'Maria Santos completed her site visit at Jeddah Waterfront', link: '/leads' },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }
  console.log(`  ✅ Created ${notifications.length} notifications`);

  // ============================================================
  // 14. ACTIVITY LOGS
  // ============================================================
  console.log('\n📊 Creating activity logs...');

  const activityLogs = [
    { tenantId: tenantAr.id, entityType: 'Property', entityId: prop1.id, action: 'CREATE', description: 'تم إنشاء مشروع أبراج الرياض', performedBy: adminAr.id },
    { tenantId: tenantAr.id, entityType: 'Unit', entityId: createdUnits[0], action: 'STATUS_CHANGE', description: 'تم تغيير حالة الوحدة 101 إلى محجوزة', performedBy: brokerAr.id },
    { tenantId: tenantAr.id, entityType: 'Lead', entityId: createdLeads[5], action: 'STAGE_CHANGE', description: 'تم تحويل العميل المحتمل إلى مرحلة "مكسوب"', performedBy: brokerAr.id },
    { tenantId: tenantEn.id, entityType: 'Property', entityId: prop2.id, action: 'CREATE', description: 'Created Jeddah Waterfront Residences project', performedBy: adminEn.id },
    { tenantId: tenantEn.id, entityType: 'Property', entityId: prop3.id, action: 'CREATE', description: 'Created KAFD Business Hub project', performedBy: adminEn.id },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({ data: log });
  }
  console.log(`  ✅ Created ${activityLogs.length} activity logs`);

  // ============================================================
  // 15. CAMPAIGNS
  // ============================================================
  console.log('\n📣 Creating campaigns...');

  await prisma.campaign.create({
    data: {
      tenantId: tenantAr.id,
      name: 'عروض الصيف — أبراج الرياض',
      description: 'خصم 10% على جميع الشقق المتاحة في البرج الشمالي خلال فصل الصيف',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      propertyIds: [prop1.id],
      createdBy: adminAr.id,
    },
  });

  await prisma.campaign.create({
    data: {
      tenantId: tenantEn.id,
      name: 'Early Bird Discount',
      description: 'SAR 50,000 off for first 10 buyers at Jeddah Waterfront',
      discountType: 'fixed',
      discountValue: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      propertyIds: [prop2.id],
      createdBy: adminEn.id,
    },
  });
  console.log('  ✅ Created 2 campaigns');

  // ============================================================
  // DONE
  // ============================================================
  console.log('\n================================================');
  console.log('  🎉 Seeding completed successfully!');
  console.log('================================================');
  console.log('\n  Default credentials (all users):');
  console.log('    Password: Admin@123');
  console.log('\n  Arabic Tenant (دار الأركان):');
  console.log('    Admin:   admin@dar-alarkan.sa');
  console.log('    Manager: manager@dar-alarkan.sa');
  console.log('    Broker:  broker@dar-alarkan.sa');
  console.log('\n  English Tenant (Gulf Properties):');
  console.log('    Admin:   admin@gulfproperties.com');
  console.log('    Manager: manager@gulfproperties.com');
  console.log('    Broker:  broker@gulfproperties.com');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
