import type { Campaign, CampaignUnit, CampaignStatus } from "./types";

export const mockCampaigns: Campaign[] = [
  {
    id: "campaign_1",
    name: "Ramadan Offer",
    nameAr: "عرض رمضان",
    description: "Special discount for Ramadan season on selected units",
    descriptionAr: "خصم خاص بمناسبة شهر رمضان على وحدات مختارة",
    status: "active",
    discountType: "percentage",
    discountValue: 15,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-04-01T00:00:00Z",
    propertyIds: ["prop_1", "prop_2"],
    unitIds: ["unit_101", "unit_102", "unit_205", "unit_301"],
    stats: {
      unitsAffected: 4,
      unitsSold: 1,
      revenueImpact: -270000,
    },
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-03-08T14:00:00Z",
  },
  {
    id: "campaign_2",
    name: "Early Bird 2026",
    nameAr: "حجز مبكر 2026",
    description: "Fixed discount for early reservations in Tower C",
    descriptionAr: "خصم ثابت للحجز المبكر في برج ج",
    status: "draft",
    discountType: "fixed",
    discountValue: 50000,
    startDate: "2026-04-01T00:00:00Z",
    endDate: "2026-06-30T00:00:00Z",
    propertyIds: ["prop_1"],
    stats: {
      unitsAffected: 8,
      unitsSold: 0,
      revenueImpact: 0,
    },
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "campaign_3",
    name: "Summer Sale 2025",
    nameAr: "تخفيضات الصيف 2025",
    description: "Summer promotion for remaining inventory",
    descriptionAr: "عروض صيفية على الوحدات المتبقية",
    status: "ended",
    discountType: "percentage",
    discountValue: 10,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2025-08-31T00:00:00Z",
    propertyIds: ["prop_1", "prop_2", "prop_3"],
    stats: {
      unitsAffected: 12,
      unitsSold: 5,
      revenueImpact: -600000,
    },
    createdAt: "2025-05-20T10:00:00Z",
    updatedAt: "2025-09-01T00:00:00Z",
  },
];

export const mockCampaignUnits: CampaignUnit[] = [
  { unitId: "unit_101", unitNumber: "A-101", originalPrice: 1800000, discountedPrice: 1530000, status: "reserved" },
  { unitId: "unit_102", unitNumber: "A-102", originalPrice: 1200000, discountedPrice: 1020000, status: "available" },
  { unitId: "unit_205", unitNumber: "B-205", originalPrice: 2400000, discountedPrice: 2040000, status: "available" },
  { unitId: "unit_301", unitNumber: "A-301", originalPrice: 950000, discountedPrice: 807500, status: "available" },
];

export const CAMPAIGN_STATUS_CONFIG: Record<
  CampaignStatus,
  { color: string; bgClass: string }
> = {
  draft: {
    color: "text-gray-600 dark:text-gray-400",
    bgClass: "bg-gray-50 dark:bg-gray-900/30",
  },
  active: {
    color: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  ended: {
    color: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
  },
  paused: {
    color: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
  },
};
