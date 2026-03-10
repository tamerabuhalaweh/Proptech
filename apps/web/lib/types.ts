// Shared TypeScript types for the frontend

export type PropertyType = "residential" | "commercial" | "mixed" | "land";
export type PropertyStatus = "active" | "under_construction" | "completed" | "archived";
export type UnitStatus = "available" | "reserved" | "occupied" | "blocked" | "maintenance";
export type UnitType = "studio" | "1br" | "2br" | "3br" | "4br" | "penthouse" | "commercial" | "retail";

export interface PropertySummary {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  type: PropertyType;
  status: PropertyStatus;
  address: {
    street: string;
    streetAr: string;
    city: string;
    cityAr: string;
    district: string;
    districtAr: string;
    coordinates?: { lat: number; lng: number };
  };
  coverImage?: { url: string; blurHash?: string };
  stats: {
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    revenueMTD: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDetail extends PropertySummary {
  description?: string;
  descriptionAr?: string;
  details: {
    yearBuilt?: string;
    yearBuiltGregorian?: number;
    totalArea?: number;
    builtUpArea?: number;
    numberOfFloors?: number;
    numberOfBuildings?: number;
    parkingSpots?: number;
    developer?: string;
    developerAr?: string;
  };
  amenities: Array<{
    id: string;
    icon: string;
    name: string;
    nameAr: string;
  }>;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  stats: {
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    occupiedUnits: number;
    blockedUnits: number;
    occupancyRate: number;
    revenueMTD: number;
    revenueYTD?: number;
    avgRentPerSqm?: number;
  };
  buildings: Building[];
  images: PropertyImage[];
}

export interface Building {
  id: string;
  name: string;
  nameAr: string;
  floors: number;
  unitsCount?: number;
  units?: Unit[];
}

export interface Unit {
  id: string;
  number: string;
  floor: number;
  buildingId: string;
  buildingName?: string;
  buildingNameAr?: string;
  type: UnitType;
  status: UnitStatus;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: {
    balcony?: boolean;
    view?: string;
    viewAr?: string;
    parkingSpot?: string;
    furnished?: boolean;
  };
  pricing?: {
    annualRent: number;
    pricePerSqm: number;
    lastUpdated?: string;
  };
  tenant?: {
    id: string;
    name: string;
    nameAr?: string;
    leaseStart?: string;
    leaseEnd?: string;
    leaseStatus?: "active" | "expiring" | "expired";
  };
  history?: Array<{
    action: string;
    actionAr?: string;
    date: string;
    dateHijri?: string;
    actor: string;
    note?: string;
  }>;
}

export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  blurHash?: string;
  category: string;
  title: string;
  titleAr?: string;
  order: number;
}

export interface BuildingGrid {
  buildingId: string;
  name: string;
  nameAr: string;
  maxFloor: number;
  maxUnitsPerFloor: number;
  floors: Array<{
    floor: number;
    units: Array<{
      id: string;
      number: string;
      column: number;
      type: string;
      status: UnitStatus;
      area: number;
      price: number;
    } | null>;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalProperties: { value: number; change: number; changePercent: number };
  occupancyRate: { value: number; change: number; changePercent: number };
  revenueMTD: { value: number; currency: string; change: number; changePercent: number };
  activeLeads: { value: number; newThisWeek: number };
}

export interface DashboardActivity {
  id: string;
  type: "lead" | "payment" | "lease" | "maintenance" | "property";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  timestamp: string;
}

export interface TopProperty {
  id: string;
  name: string;
  nameAr: string;
  units: number;
  occupancy: number;
  revenue: number;
  trend: number;
}

// ===== Lead / CRM Types =====

export type LeadStage = "new" | "contacted" | "qualified" | "viewing" | "negotiation" | "won" | "lost";
export type LeadScoreLabel = "hot" | "warm" | "cold";
export type LeadSource = "website" | "walk_in" | "referral" | "social_media" | "phone" | "partner" | "other";
export type LeadInterestType = "buy" | "rent";
export type LeadTimeline = "immediate" | "1-3months" | "3-6months" | "6plus";
export type ActivityType = "call" | "email" | "meeting" | "note" | "status_change" | "system";

export interface LeadContact {
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  preferredContact: "phone" | "email" | "whatsapp";
  preferredLanguage: "ar" | "en";
}

export interface LeadInterest {
  type: LeadInterestType;
  propertyType: string;
  propertyTypeAr: string;
  city: string;
  cityAr: string;
  district?: string;
  districtAr?: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms?: number;
  timeline: LeadTimeline;
  specificPropertyId?: string;
  specificUnitId?: string;
}

export interface LeadAgent {
  id: string;
  name: string;
  nameAr: string;
  avatar?: string;
}

export interface LeadNextAction {
  type: string;
  typeAr: string;
  date: string;
  description: string;
  descriptionAr: string;
}

export interface Lead {
  id: string;
  contact: LeadContact;
  score: number;
  scoreLabel: LeadScoreLabel;
  stage: LeadStage;
  stageChangedAt: string;
  interest: LeadInterest;
  source: LeadSource;
  agent: LeadAgent;
  nextAction?: LeadNextAction;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lostReason?: string;
  wonPropertyId?: string;
  wonUnitId?: string;
}

export interface LeadActivity {
  id: string;
  type: ActivityType;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  actor: { name: string; nameAr?: string; avatar?: string };
  timestamp: string;
}

export interface PipelineStageStats {
  stage: LeadStage;
  count: number;
  totalValue: number;
}

export interface PipelineSummary {
  stages: PipelineStageStats[];
  conversionRate: number;
  avgDaysToClose: number;
  totalLeads: number;
  activeLeads: number;
}

export interface LeadCardData {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  scoreLabel: LeadScoreLabel;
  location: string;
  locationAr: string;
  interest: string;
  interestAr: string;
  budgetMin: number;
  budgetMax: number;
  agent: LeadAgent;
  nextAction?: { type: string; date: string };
  lastActivityAt: string;
  stage: LeadStage;
  source: LeadSource;
  phone: string;
  email?: string;
}

// ===== Settings Types =====

export interface TenantProfile {
  id: string;
  name: string;
  nameAr: string;
  industry: string;
  vatNumber: string;
  crNumber: string;
  logo?: { url: string; thumbnailUrl: string };
  address: {
    street: string;
    streetAr: string;
    city: string;
    cityAr: string;
    district: string;
    districtAr: string;
    postalCode: string;
  };
  contact: { phone: string; email: string; website?: string };
  branding: { primaryColor: string; accentColor: string };
  settings: TenantSettings;
  subscription: TenantSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  defaultLocale: "ar" | "en";
  dateFormat: "hijri" | "gregorian" | "both";
  primaryCalendar: "hijri" | "gregorian";
  timeFormat: "12h" | "24h";
  numberFormat: "arabic-indic" | "western";
  currencyPosition: "before" | "after";
  firstDayOfWeek: "saturday" | "sunday" | "monday";
  timezone: string;
}

export interface TenantSubscription {
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "trialing" | "past_due" | "cancelled";
  currentPeriodEnd: string;
  monthlyPrice: number;
  currency: "SAR";
  usage: {
    properties: { used: number; limit: number };
    users: { used: number; limit: number };
    storage: { usedGB: number; limitGB: number };
  };
}

export interface TenantUser {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: "admin" | "manager" | "agent" | "viewer";
  status: "active" | "inactive";
  avatar?: string;
  lastActiveAt: string;
}

export interface TenantRole {
  id: string;
  name: string;
  nameAr: string;
  isSystem: boolean;
  usersCount: number;
  permissions: RolePermission[];
}

export interface RolePermission {
  module: string;
  moduleAr: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

export interface NotificationPreference {
  category: string;
  categoryAr: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

// ===== Booking Types =====

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired" | "completed";

export interface BookingClient {
  id?: string;
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  nationalId?: string;
}

export interface BookingPaymentPlan {
  totalPrice: number;
  downPayment: number;
  installmentCount: number;
  installmentAmount: number;
  schedule: BookingInstallment[];
}

export interface BookingInstallment {
  number: number;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

export interface Booking {
  id: string;
  unitId: string;
  unitNumber: string;
  buildingName?: string;
  buildingNameAr?: string;
  propertyName?: string;
  propertyNameAr?: string;
  client: BookingClient;
  status: BookingStatus;
  paymentPlan: BookingPaymentPlan;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

// ===== Campaign Types =====

export type CampaignStatus = "draft" | "active" | "ended" | "paused";
export type DiscountType = "percentage" | "fixed";

export interface Campaign {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  status: CampaignStatus;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  propertyIds: string[];
  unitIds?: string[];
  stats: {
    unitsAffected: number;
    unitsSold: number;
    revenueImpact: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUnit {
  unitId: string;
  unitNumber: string;
  originalPrice: number;
  discountedPrice: number;
  status: UnitStatus;
}

// ===== Lead Duplicate Types =====

export interface DuplicateLead {
  id: string;
  name: string;
  nameAr: string;
  email?: string;
  phone: string;
  stage: LeadStage;
  score: number;
  scoreLabel: LeadScoreLabel;
  confidence: number;
  lastActivityAt: string;
}

export interface MergeFieldChoice {
  field: string;
  fieldLabel: string;
  fieldLabelAr: string;
  targetValue: string;
  sourceValue: string;
  selected: "target" | "source";
}

// ===== Subscription Extended Types =====

export interface SubscriptionPlan {
  key: "starter" | "professional" | "enterprise";
  price: number;
  properties: number;
  units: number;
  users: number;
  storageGB: number;
  features: string[];
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  descriptionAr: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

// ===== Locale Types =====

export interface LocaleSettings {
  defaultLocale: "ar" | "en";
  dateFormat: "hijri" | "gregorian" | "both";
  primaryCalendar: "hijri" | "gregorian";
  timeFormat: "12h" | "24h";
  numberFormat: "arabic-indic" | "western";
  currencyPosition: "before" | "after";
  currency: "SAR" | "AED" | "USD";
  firstDayOfWeek: "saturday" | "sunday" | "monday";
  timezone: string;
}
