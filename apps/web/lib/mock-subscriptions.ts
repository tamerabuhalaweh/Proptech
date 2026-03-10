import type { SubscriptionPlan, BillingHistoryItem, TenantSubscription } from "./types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    key: "starter",
    price: 499,
    properties: 5,
    units: 50,
    users: 3,
    storageGB: 5,
    features: [
      "basic_analytics",
      "email_support",
      "inventory_management",
      "lead_management",
    ],
  },
  {
    key: "professional",
    price: 1499,
    properties: 25,
    units: 500,
    users: 15,
    storageGB: 50,
    features: [
      "advanced_analytics",
      "priority_support",
      "api_access",
      "custom_roles",
      "campaign_pricing",
      "duplicate_detection",
      "bulk_operations",
    ],
  },
  {
    key: "enterprise",
    price: 3999,
    properties: -1,
    units: -1,
    users: -1,
    storageGB: 500,
    features: [
      "dedicated_support",
      "sla",
      "custom_integrations",
      "white_label",
      "unlimited",
      "hijri_calendar",
      "advanced_reporting",
      "audit_log",
    ],
  },
];

export const mockCurrentSubscription: TenantSubscription = {
  plan: "professional",
  status: "active",
  currentPeriodEnd: "2026-04-10T00:00:00Z",
  monthlyPrice: 1499,
  currency: "SAR",
  usage: {
    properties: { used: 12, limit: 25 },
    users: { used: 8, limit: 15 },
    storage: { usedGB: 18.5, limitGB: 50 },
  },
};

export const mockBillingHistory: BillingHistoryItem[] = [
  {
    id: "inv_1",
    date: "2026-03-10T00:00:00Z",
    description: "Professional Plan — March 2026",
    descriptionAr: "الخطة الاحترافية — مارس 2026",
    amount: 1499,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "inv_2",
    date: "2026-02-10T00:00:00Z",
    description: "Professional Plan — February 2026",
    descriptionAr: "الخطة الاحترافية — فبراير 2026",
    amount: 1499,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "inv_3",
    date: "2026-01-10T00:00:00Z",
    description: "Professional Plan — January 2026",
    descriptionAr: "الخطة الاحترافية — يناير 2026",
    amount: 1499,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "inv_4",
    date: "2025-12-10T00:00:00Z",
    description: "Starter Plan — December 2025",
    descriptionAr: "الخطة الأساسية — ديسمبر 2025",
    amount: 499,
    status: "paid",
    invoiceUrl: "#",
  },
  {
    id: "inv_5",
    date: "2025-11-10T00:00:00Z",
    description: "Starter Plan — November 2025",
    descriptionAr: "الخطة الأساسية — نوفمبر 2025",
    amount: 499,
    status: "paid",
    invoiceUrl: "#",
  },
];
