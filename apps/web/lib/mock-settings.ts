import type {
  TenantProfile,
  TenantUser,
  TenantRole,
  NotificationPreference,
  ActiveSession,
} from "./types";

export const mockTenantProfile: TenantProfile = {
  id: "tenant_1",
  name: "Al Rajhi Properties",
  nameAr: "عقارات الراجحي",
  industry: "real_estate",
  vatNumber: "300012345600003",
  crNumber: "1010123456",
  logo: { url: "/logo.png", thumbnailUrl: "/logo-thumb.png" },
  address: {
    street: "King Fahd Road",
    streetAr: "طريق الملك فهد",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    districtAr: "العليا",
    postalCode: "12211",
  },
  contact: {
    phone: "+966112345678",
    email: "info@alrajhi-properties.sa",
    website: "https://alrajhi-properties.sa",
  },
  branding: { primaryColor: "#1E3A5F", accentColor: "#D4A843" },
  settings: {
    defaultLocale: "ar",
    dateFormat: "both",
    primaryCalendar: "hijri",
    timeFormat: "12h",
    numberFormat: "western",
    currencyPosition: "after",
    firstDayOfWeek: "sunday",
    timezone: "Asia/Riyadh",
  },
  subscription: {
    plan: "professional",
    status: "active",
    currentPeriodEnd: "2026-04-01T00:00:00Z",
    monthlyPrice: 2500,
    currency: "SAR",
    usage: {
      properties: { used: 24, limit: 50 },
      users: { used: 12, limit: 25 },
      storage: { usedGB: 8.2, limitGB: 20 },
    },
  },
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2026-03-10T00:00:00Z",
};

export const mockUsers: TenantUser[] = [
  { id: "user_1", name: "Ahmed Hassan", nameAr: "أحمد حسن", email: "ahmed@rajhi.sa", role: "admin", status: "active", lastActiveAt: "2026-03-10T18:00:00Z" },
  { id: "user_2", name: "Sara Ali", nameAr: "سارة علي", email: "sara@rajhi.sa", role: "manager", status: "active", lastActiveAt: "2026-03-10T16:00:00Z" },
  { id: "user_3", name: "Khalid Omar", nameAr: "خالد عمر", email: "khalid@rajhi.sa", role: "agent", status: "active", lastActiveAt: "2026-03-10T15:00:00Z" },
  { id: "user_4", name: "Saad Al-Harbi", nameAr: "سعد الحربي", email: "saad@rajhi.sa", role: "agent", status: "active", lastActiveAt: "2026-03-10T14:00:00Z" },
  { id: "user_5", name: "Huda Al-Rashid", nameAr: "هدى الراشد", email: "huda@rajhi.sa", role: "agent", status: "active", lastActiveAt: "2026-03-09T17:00:00Z" },
  { id: "user_6", name: "Omar Al-Faraj", nameAr: "عمر الفرج", email: "omar@rajhi.sa", role: "agent", status: "active", lastActiveAt: "2026-03-09T16:00:00Z" },
  { id: "user_7", name: "Noura Al-Saud", nameAr: "نورة السعود", email: "noura@rajhi.sa", role: "agent", status: "inactive", lastActiveAt: "2026-02-15T10:00:00Z" },
  { id: "user_8", name: "Fahad Al-Tamimi", nameAr: "فهد التميمي", email: "fahad@rajhi.sa", role: "viewer", status: "active", lastActiveAt: "2026-03-10T12:00:00Z" },
];

export const mockRoles: TenantRole[] = [
  {
    id: "role_admin",
    name: "Admin",
    nameAr: "مدير النظام",
    isSystem: true,
    usersCount: 1,
    permissions: [
      { module: "Dashboard", moduleAr: "لوحة التحكم", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "Properties", moduleAr: "العقارات", actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: "Inventory", moduleAr: "المخزون", actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: "Leads", moduleAr: "العملاء", actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: "Finance", moduleAr: "المالية", actions: { view: true, create: true, edit: true, delete: true, export: true } },
      { module: "Reports", moduleAr: "التقارير", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "Settings", moduleAr: "الإعدادات", actions: { view: true, create: true, edit: true, delete: true, export: false } },
      { module: "Users", moduleAr: "المستخدمين", actions: { view: true, create: true, edit: true, delete: true, export: false } },
    ],
  },
  {
    id: "role_manager",
    name: "Manager",
    nameAr: "مدير",
    isSystem: true,
    usersCount: 1,
    permissions: [
      { module: "Dashboard", moduleAr: "لوحة التحكم", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "Properties", moduleAr: "العقارات", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "Inventory", moduleAr: "المخزون", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "Leads", moduleAr: "العملاء", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "Finance", moduleAr: "المالية", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "Reports", moduleAr: "التقارير", actions: { view: true, create: false, edit: false, delete: false, export: true } },
      { module: "Settings", moduleAr: "الإعدادات", actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: "Users", moduleAr: "المستخدمين", actions: { view: true, create: false, edit: false, delete: false, export: false } },
    ],
  },
  {
    id: "role_agent",
    name: "Agent",
    nameAr: "وكيل",
    isSystem: true,
    usersCount: 4,
    permissions: [
      { module: "Dashboard", moduleAr: "لوحة التحكم", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Properties", moduleAr: "العقارات", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Inventory", moduleAr: "المخزون", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Leads", moduleAr: "العملاء", actions: { view: true, create: true, edit: true, delete: false, export: true } },
      { module: "Finance", moduleAr: "المالية", actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: "Reports", moduleAr: "التقارير", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Settings", moduleAr: "الإعدادات", actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: "Users", moduleAr: "المستخدمين", actions: { view: false, create: false, edit: false, delete: false, export: false } },
    ],
  },
  {
    id: "role_viewer",
    name: "Viewer",
    nameAr: "مشاهد",
    isSystem: true,
    usersCount: 1,
    permissions: [
      { module: "Dashboard", moduleAr: "لوحة التحكم", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Properties", moduleAr: "العقارات", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Inventory", moduleAr: "المخزون", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Leads", moduleAr: "العملاء", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Finance", moduleAr: "المالية", actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: "Reports", moduleAr: "التقارير", actions: { view: true, create: false, edit: false, delete: false, export: false } },
      { module: "Settings", moduleAr: "الإعدادات", actions: { view: false, create: false, edit: false, delete: false, export: false } },
      { module: "Users", moduleAr: "المستخدمين", actions: { view: false, create: false, edit: false, delete: false, export: false } },
    ],
  },
];

export const mockNotificationPreferences: NotificationPreference[] = [
  { category: "New Lead", categoryAr: "عميل محتمل جديد", inApp: true, email: true, sms: false },
  { category: "Lead Assigned", categoryAr: "تم تعيين عميل", inApp: true, email: true, sms: false },
  { category: "Lease Expiring", categoryAr: "عقد إيجار ينتهي", inApp: true, email: true, sms: true },
  { category: "Payment Received", categoryAr: "تم استلام دفعة", inApp: true, email: true, sms: false },
  { category: "Maintenance Request", categoryAr: "طلب صيانة", inApp: true, email: true, sms: false },
  { category: "System Updates", categoryAr: "تحديثات النظام", inApp: true, email: false, sms: false },
  { category: "Weekly Report", categoryAr: "التقرير الأسبوعي", inApp: false, email: true, sms: false },
];

export const mockActiveSessions: ActiveSession[] = [
  { id: "sess_1", device: "MacBook Pro", browser: "Chrome 122", ip: "86.111.48.xx", location: "Riyadh, SA", lastActiveAt: "2026-03-10T18:00:00Z", current: true },
  { id: "sess_2", device: "iPhone 15 Pro", browser: "Safari", ip: "86.111.48.xx", location: "Riyadh, SA", lastActiveAt: "2026-03-10T16:30:00Z", current: false },
  { id: "sess_3", device: "Windows Desktop", browser: "Edge 122", ip: "86.111.49.xx", location: "Riyadh, SA", lastActiveAt: "2026-03-09T11:00:00Z", current: false },
];
