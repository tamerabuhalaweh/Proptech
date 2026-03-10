"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { MILESTONE_STATUS_CONFIG } from "@/lib/mock-milestones";
import type { Milestone } from "@/lib/types";

interface MilestoneCardProps {
  milestone: Milestone;
  onRecordPayment?: (id: string) => void;
}

export function MilestoneCard({ milestone, onRecordPayment }: MilestoneCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const statusConfig = MILESTONE_STATUS_CONFIG[milestone.status];
  const canRecordPayment = milestone.status !== "paid" && milestone.status !== "cancelled";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3 transition-colors",
        milestone.status === "overdue" && "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
        milestone.status === "due" && "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
        milestone.status === "paid" && "border-emerald-200 dark:border-emerald-900"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {isAr && milestone.nameAr ? milestone.nameAr : milestone.name}
          </p>
          {(milestone.description || milestone.descriptionAr) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr && milestone.descriptionAr ? milestone.descriptionAr : milestone.description}
            </p>
          )}
        </div>
        <Badge
          className={cn(
            "border-transparent font-medium text-xs shrink-0",
            statusConfig.bgClass,
            statusConfig.color
          )}
        >
          {isAr ? statusConfig.labelAr : statusConfig.label}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</p>
            <p className="text-sm font-semibold">
              <CurrencyDisplay amount={milestone.amount} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{isAr ? "تاريخ الاستحقاق" : "Due Date"}</p>
            <DateDisplay date={milestone.dueDate} className="text-sm" />
          </div>
        </div>

        {canRecordPayment && (
          <Button
            size="sm"
            variant={milestone.status === "overdue" ? "destructive" : "outline"}
            onClick={() => onRecordPayment?.(milestone.id)}
          >
            <CreditCard className="h-3.5 w-3.5 me-1" />
            {isAr ? "تسجيل دفعة" : "Record Payment"}
          </Button>
        )}
      </div>

      {/* Payment info if paid */}
      {milestone.payment && (
        <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            {isAr ? "تم الدفع" : "Paid"}{" "}
            {milestone.payment.method === "bank_transfer" ? (isAr ? "تحويل بنكي" : "Bank Transfer") :
             milestone.payment.method === "cash" ? (isAr ? "نقدي" : "Cash") :
             milestone.payment.method === "cheque" ? (isAr ? "شيك" : "Cheque") :
             milestone.payment.method === "credit_card" ? (isAr ? "بطاقة ائتمان" : "Credit Card") :
             (isAr ? "أخرى" : "Other")}
          </span>
          {milestone.payment.receiptNumber && (
            <span>• {milestone.payment.receiptNumber}</span>
          )}
        </div>
      )}
    </div>
  );
}
