"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CurrencyDisplay } from "@/components/common/currency-display";
import type { Milestone } from "@/lib/types";

interface PaymentSummaryProps {
  milestones: Milestone[];
}

export function PaymentSummary({ milestones }: PaymentSummaryProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const paidAmount = milestones
    .filter((m) => m.status === "paid")
    .reduce((sum, m) => sum + m.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  const progressPercent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const overdueAmount = milestones
    .filter((m) => m.status === "overdue")
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {isAr ? "ملخص الدفعات" : "Payment Summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryItem
            label={isAr ? "المبلغ الإجمالي" : "Total Amount"}
            value={<CurrencyDisplay amount={totalAmount} />}
          />
          <SummaryItem
            label={isAr ? "المدفوع" : "Paid"}
            value={<CurrencyDisplay amount={paidAmount} className="text-emerald-600 dark:text-emerald-400" />}
          />
          <SummaryItem
            label={isAr ? "المتبقي" : "Remaining"}
            value={<CurrencyDisplay amount={remainingAmount} />}
          />
          {overdueAmount > 0 && (
            <SummaryItem
              label={isAr ? "متأخر" : "Overdue"}
              value={<CurrencyDisplay amount={overdueAmount} className="text-red-600 dark:text-red-400" />}
            />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isAr ? "نسبة التحصيل" : "Collection Progress"}
            </span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
