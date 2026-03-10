import type { Booking, BookingStatus, BookingInstallment } from "./types";

function generateInstallments(
  total: number,
  downPayment: number,
  count: number,
  startDate: string
): BookingInstallment[] {
  const remaining = total - downPayment;
  const amount = Math.round(remaining / count);
  const installments: BookingInstallment[] = [];
  const start = new Date(startDate);

  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    installments.push({
      number: i,
      amount: i === count ? remaining - amount * (count - 1) : amount,
      dueDate: dueDate.toISOString(),
      status: i <= 2 ? "paid" : "pending",
    });
  }
  return installments;
}

export const mockBookings: Booking[] = [
  {
    id: "booking_1",
    unitId: "unit_101",
    unitNumber: "A-101",
    buildingName: "Tower A",
    buildingNameAr: "برج أ",
    propertyName: "Al Noor Tower",
    propertyNameAr: "برج النور",
    client: {
      id: "lead_1",
      name: "Ahmed Al-Qahtani",
      nameAr: "أحمد القحطاني",
      phone: "+966501234567",
      email: "ahmed@email.com",
      nationalId: "1099887766",
    },
    status: "confirmed",
    paymentPlan: {
      totalPrice: 1800000,
      downPayment: 360000,
      installmentCount: 12,
      installmentAmount: 120000,
      schedule: generateInstallments(1800000, 360000, 12, "2026-01-15"),
    },
    createdAt: "2026-01-10T08:00:00Z",
    confirmedAt: "2026-01-12T10:30:00Z",
  },
  {
    id: "booking_2",
    unitId: "unit_205",
    unitNumber: "B-205",
    buildingName: "Tower B",
    buildingNameAr: "برج ب",
    propertyName: "Al Noor Tower",
    propertyNameAr: "برج النور",
    client: {
      id: "lead_3",
      name: "Khalid Ibrahim",
      nameAr: "خالد إبراهيم",
      phone: "+966551112233",
      email: "khalid@corp.com",
    },
    status: "pending",
    paymentPlan: {
      totalPrice: 2400000,
      downPayment: 480000,
      installmentCount: 24,
      installmentAmount: 80000,
      schedule: generateInstallments(2400000, 480000, 24, "2026-03-01"),
    },
    createdAt: "2026-03-05T14:00:00Z",
    expiresAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "booking_3",
    unitId: "unit_301",
    unitNumber: "A-301",
    buildingName: "Tower A",
    buildingNameAr: "برج أ",
    propertyName: "Al Noor Tower",
    propertyNameAr: "برج النور",
    client: {
      name: "Fatima Hassan",
      nameAr: "فاطمة حسن",
      phone: "+966509876543",
      email: "fatima@email.com",
    },
    status: "completed",
    paymentPlan: {
      totalPrice: 950000,
      downPayment: 190000,
      installmentCount: 6,
      installmentAmount: 126667,
      schedule: generateInstallments(950000, 190000, 6, "2025-06-01"),
    },
    createdAt: "2025-06-01T09:00:00Z",
    confirmedAt: "2025-06-03T11:00:00Z",
    completedAt: "2025-12-15T16:00:00Z",
  },
  {
    id: "booking_4",
    unitId: "unit_102",
    unitNumber: "A-102",
    buildingName: "Tower A",
    buildingNameAr: "برج أ",
    propertyName: "Riyadh Heights",
    propertyNameAr: "مرتفعات الرياض",
    client: {
      name: "Omar Al-Faraj",
      nameAr: "عمر الفرج",
      phone: "+966559998877",
    },
    status: "cancelled",
    paymentPlan: {
      totalPrice: 1200000,
      downPayment: 240000,
      installmentCount: 12,
      installmentAmount: 80000,
      schedule: generateInstallments(1200000, 240000, 12, "2026-02-01"),
    },
    cancelReason: "Client changed mind — relocated to Jeddah",
    createdAt: "2026-02-01T10:00:00Z",
    cancelledAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "booking_5",
    unitId: "unit_401",
    unitNumber: "C-401",
    buildingName: "Tower C",
    buildingNameAr: "برج ج",
    propertyName: "Al Noor Tower",
    propertyNameAr: "برج النور",
    client: {
      name: "Noura Al-Saud",
      nameAr: "نورة السعود",
      phone: "+966554443322",
      email: "noura@email.com",
    },
    status: "expired",
    paymentPlan: {
      totalPrice: 3200000,
      downPayment: 640000,
      installmentCount: 36,
      installmentAmount: 71111,
      schedule: generateInstallments(3200000, 640000, 36, "2026-01-01"),
    },
    createdAt: "2026-01-01T12:00:00Z",
    expiresAt: "2026-01-15T12:00:00Z",
  },
];

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { color: string; bgClass: string; emoji: string }
> = {
  pending: {
    color: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    emoji: "🟡",
  },
  confirmed: {
    color: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    emoji: "🟢",
  },
  cancelled: {
    color: "text-red-700 dark:text-red-400",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    emoji: "🔴",
  },
  expired: {
    color: "text-gray-600 dark:text-gray-400",
    bgClass: "bg-gray-50 dark:bg-gray-900/30",
    emoji: "⚪",
  },
  completed: {
    color: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    emoji: "🔵",
  },
};
