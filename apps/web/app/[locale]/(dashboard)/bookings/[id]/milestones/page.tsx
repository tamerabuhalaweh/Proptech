"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Plus, Calculator, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { PaymentSummary } from "@/components/milestones/payment-summary";
import { MilestoneTimeline } from "@/components/milestones/milestone-timeline";
import { AddMilestoneDialog } from "@/components/milestones/add-milestone-dialog";
import { RecordPaymentDialog } from "@/components/milestones/record-payment-dialog";
import { InstallmentGenerator } from "@/components/milestones/installment-generator";
import { useMilestones } from "@/hooks/api/use-milestones";
import { mockMilestones } from "@/lib/mock-milestones";
import type { Milestone } from "@/lib/types";

export default function MilestonesPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const params = useParams();
  const bookingId = params.id as string;

  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [installmentGenOpen, setInstallmentGenOpen] = useState(false);

  const { data, isLoading } = useMilestones(bookingId);
  const milestones = (data?.data || mockMilestones) as Milestone[];

  const selectedMilestone = selectedMilestoneId
    ? milestones.find((m) => m.id === selectedMilestoneId)
    : null;

  const handleRecordPayment = useCallback((id: string) => {
    setSelectedMilestoneId(id);
    setRecordPaymentOpen(true);
  }, []);

  const handleAddMilestone = useCallback(
    (formData: { name: string; amount: number; dueDate: string; description?: string }) => {
      console.log("Add milestone:", { bookingId, ...formData });
    },
    [bookingId]
  );

  const handlePaymentSubmit = useCallback(
    (formData: Record<string, unknown>) => {
      console.log("Record payment:", { bookingId, milestoneId: selectedMilestoneId, ...formData });
    },
    [bookingId, selectedMilestoneId]
  );

  const handleGenerateInstallments = useCallback(
    (formData: { totalAmount: number; numberOfInstallments: number; startDate: string }) => {
      console.log("Generate installments:", { bookingId, ...formData });
    },
    [bookingId]
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb-like back link */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/bookings" className="hover:text-foreground transition-colors">
          {isAr ? "الحجوزات" : "Bookings"}
        </Link>
        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        <span>{bookingId}</span>
        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        <span className="text-foreground font-medium">
          {isAr ? "المراحل والدفعات" : "Milestones & Payments"}
        </span>
      </div>

      <PageHeader
        title={isAr ? "المراحل والدفعات" : "Milestones & Payments"}
        subtitle={
          isAr
            ? `الحجز ${bookingId} — ${milestones.length} مرحلة`
            : `Booking ${bookingId} — ${milestones.length} milestones`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setInstallmentGenOpen(true)}>
              <Calculator className="h-4 w-4 me-1" />
              {isAr ? "مولّد الأقساط" : "Generate Plan"}
            </Button>
            <Button onClick={() => setAddMilestoneOpen(true)}>
              <Plus className="h-4 w-4 me-1" />
              {isAr ? "إضافة مرحلة" : "Add Milestone"}
            </Button>
          </div>
        }
      />

      {/* Payment Summary */}
      <PaymentSummary milestones={milestones} />

      {/* Milestone Timeline */}
      <MilestoneTimeline
        milestones={milestones}
        loading={isLoading}
        onRecordPayment={handleRecordPayment}
      />

      {/* Dialogs */}
      <AddMilestoneDialog
        open={addMilestoneOpen}
        onOpenChange={setAddMilestoneOpen}
        onSubmit={handleAddMilestone}
      />

      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        milestoneName={selectedMilestone ? (isAr && selectedMilestone.nameAr ? selectedMilestone.nameAr : selectedMilestone.name) : undefined}
        milestoneAmount={selectedMilestone?.amount}
        onSubmit={handlePaymentSubmit}
      />

      <InstallmentGenerator
        open={installmentGenOpen}
        onOpenChange={setInstallmentGenOpen}
        onGenerate={handleGenerateInstallments}
      />
    </div>
  );
}
