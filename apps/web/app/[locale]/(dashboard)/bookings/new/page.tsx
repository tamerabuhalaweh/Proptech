"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { BookingWizard } from "@/components/bookings/booking-wizard";
import { useCreateBooking } from "@/hooks/api/use-bookings";
import { toast } from "sonner";

export default function NewBookingPage() {
  const t = useTranslations("bookings");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUnitId = searchParams.get("unitId") || undefined;
  const createBooking = useCreateBooking();

  const handleComplete = async (data: {
    unitId: string;
    client: Record<string, unknown>;
    payment: Record<string, unknown>;
  }) => {
    try {
      await createBooking.mutateAsync({
        unitId: data.unitId,
        client: data.client,
        paymentPlan: data.payment,
      });
      toast.success(t("createSuccess"));
      router.push("/bookings");
    } catch {
      toast.error(t("createError"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title={t("newBooking")} subtitle={t("newBookingSubtitle")} />
      <BookingWizard
        preselectedUnitId={preselectedUnitId}
        onComplete={handleComplete}
        onCancel={() => router.push("/bookings")}
      />
    </div>
  );
}
