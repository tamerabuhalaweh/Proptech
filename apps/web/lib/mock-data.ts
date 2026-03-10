// Mock data for the frontend while backend is being built

export const mockUser = {
  id: "user_1",
  name: "Ahmed Al-Qahtani",
  nameAr: "أحمد القحطاني",
  email: "ahmed@smartlabs.sa",
  avatar: undefined,
  role: "admin" as const,
};

export const mockTenants = [
  {
    id: "tenant_1",
    name: "Al Noor Properties",
    nameAr: "عقارات النور",
    logo: undefined,
    plan: "enterprise" as const,
  },
  {
    id: "tenant_2",
    name: "Riyadh Real Estate Co",
    nameAr: "شركة الرياض العقارية",
    logo: undefined,
    plan: "professional" as const,
  },
];

export const mockCurrentTenant = mockTenants[0];

export const mockNotifications = [
  {
    id: "notif_1",
    type: "lead" as const,
    title: "New lead assigned",
    titleAr: "تم تعيين عميل جديد",
    description: "Mohammed Al-Harbi interested in Villa #12",
    descriptionAr: "محمد الحربي مهتم بالفيلا رقم ١٢",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif_2",
    type: "payment" as const,
    title: "Payment received",
    titleAr: "تم استلام دفعة",
    description: "SAR 45,000 from Khalid - Unit 3B",
    descriptionAr: "٤٥٬٠٠٠ ر.س من خالد - الوحدة 3B",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "notif_3",
    type: "lease" as const,
    title: "Lease expiring soon",
    titleAr: "عقد إيجار ينتهي قريباً",
    description: "Unit 7A lease expires in 30 days",
    descriptionAr: "عقد إيجار الوحدة 7A ينتهي خلال ٣٠ يوماً",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "notif_4",
    type: "maintenance" as const,
    title: "Maintenance overdue",
    titleAr: "صيانة متأخرة",
    description: "AC repair - Building 2 overdue by 3 days",
    descriptionAr: "إصلاح التكييف - المبنى ٢ متأخر ٣ أيام",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export const mockDashboardKPIs = {
  totalProperties: { value: 24, change: 2, changePercent: 9.1 },
  occupancyRate: { value: 87.5, change: 3.2, changePercent: 3.8 },
  revenueMTD: {
    value: 2400000,
    currency: "SAR",
    change: 288000,
    changePercent: 12,
  },
  activeLeads: { value: 156, newThisWeek: 24 },
};

export const mockRevenueData = [
  { month: "Oct", monthAr: "أكتوبر", revenue: 1800000, previousPeriod: 1650000 },
  { month: "Nov", monthAr: "نوفمبر", revenue: 1950000, previousPeriod: 1700000 },
  { month: "Dec", monthAr: "ديسمبر", revenue: 2100000, previousPeriod: 1850000 },
  { month: "Jan", monthAr: "يناير", revenue: 2050000, previousPeriod: 1900000 },
  { month: "Feb", monthAr: "فبراير", revenue: 2250000, previousPeriod: 2000000 },
  { month: "Mar", monthAr: "مارس", revenue: 2400000, previousPeriod: 2150000 },
];

export const mockUnitStatusData = [
  { status: "available", count: 45, color: "#16A34A" },
  { status: "reserved", count: 23, color: "#D97706" },
  { status: "occupied", count: 180, color: "#2563EB" },
  { status: "blocked", count: 12, color: "#DC2626" },
];

export const mockActivities = [
  {
    id: "act_1",
    type: "lead" as const,
    title: "Lead assigned to Saad",
    titleAr: "تم تعيين العميل لسعد",
    description: "Ahmed Al-Harbi → Villa #12",
    descriptionAr: "أحمد الحربي → فيلا رقم ١٢",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "act_2",
    type: "payment" as const,
    title: "Payment received",
    titleAr: "تم استلام دفعة",
    description: "SAR 45,000 - Unit 3B",
    descriptionAr: "٤٥٬٠٠٠ ر.س - الوحدة 3B",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "act_3",
    type: "lease" as const,
    title: "Lease expiring",
    titleAr: "عقد إيجار ينتهي",
    description: "Unit 7A - in 30 days",
    descriptionAr: "الوحدة 7A - خلال ٣٠ يوماً",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act_4",
    type: "maintenance" as const,
    title: "Maintenance overdue",
    titleAr: "صيانة متأخرة",
    description: "AC repair - Building 2",
    descriptionAr: "إصلاح التكييف - المبنى ٢",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act_5",
    type: "property" as const,
    title: "Property added",
    titleAr: "تمت إضافة عقار",
    description: "Jeddah Plaza - 64 units",
    descriptionAr: "جدة بلازا - ٦٤ وحدة",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTopProperties = [
  {
    id: "prop_1",
    name: "Al Noor Residence",
    nameAr: "سكن النور",
    units: 120,
    occupancy: 92,
    revenue: 890000,
    trend: 5.2,
  },
  {
    id: "prop_2",
    name: "Riyadh Tower",
    nameAr: "برج الرياض",
    units: 85,
    occupancy: 88,
    revenue: 650000,
    trend: 3.1,
  },
  {
    id: "prop_3",
    name: "Jeddah Plaza",
    nameAr: "جدة بلازا",
    units: 64,
    occupancy: 78,
    revenue: 420000,
    trend: -2.3,
  },
  {
    id: "prop_4",
    name: "Dammam Heights",
    nameAr: "مرتفعات الدمام",
    units: 48,
    occupancy: 95,
    revenue: 380000,
    trend: 8.7,
  },
  {
    id: "prop_5",
    name: "Khobar Gardens",
    nameAr: "حدائق الخبر",
    units: 36,
    occupancy: 83,
    revenue: 280000,
    trend: 1.4,
  },
];
