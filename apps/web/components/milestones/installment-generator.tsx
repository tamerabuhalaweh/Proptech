"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyDisplay } from "@/components/common/currency-display";

interface InstallmentGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (data: { totalAmount: number; numberOfInstallments: number; startDate: string }) => void;
}

export function InstallmentGenerator({
  open,
  onOpenChange,
  onGenerate,
}: InstallmentGeneratorProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [totalAmount, setTotalAmount] = useState("");
  const [numberOfInstallments, setNumberOfInstallments] = useState("");
  const [startDate, setStartDate] = useState("");

  const total = parseFloat(totalAmount) || 0;
  const count = parseInt(numberOfInstallments) || 0;
  const perInstallment = count > 0 ? total / count : 0;

  const handleGenerate = () => {
    if (!total || !count || !startDate) return;
    onGenerate?.({
      totalAmount: total,
      numberOfInstallments: count,
      startDate,
    });
    setTotalAmount("");
    setNumberOfInstallments("");
    setStartDate("");
    onOpenChange(false);
  };

  // Generate preview
  const previewItems = count > 0 && startDate
    ? Array.from({ length: Math.min(count, 12) }, (_, i) => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        return {
          number: i + 1,
          amount: perInstallment,
          dueDate: date.toISOString().split("T")[0],
        };
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {isAr ? "مولّد خطة الأقساط" : "Installment Plan Generator"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "المبلغ الإجمالي (ر.س)" : "Total Amount (SAR)"}</Label>
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="500000"
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "عدد الأقساط" : "Number of Installments"}</Label>
              <Input
                type="number"
                value={numberOfInstallments}
                onChange={(e) => setNumberOfInstallments(e.target.value)}
                placeholder="10"
                min="1"
                max="120"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "تاريخ البداية" : "Start Date"}</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Preview */}
          {total > 0 && count > 0 && (
            <>
              <Separator />
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">
                      {isAr ? "معاينة الخطة" : "Plan Preview"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <CurrencyDisplay amount={perInstallment} />{" "}
                      {isAr ? "/ قسط" : "/ installment"}
                    </span>
                  </div>
                  {previewItems.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {previewItems.map((item) => (
                        <div
                          key={item.number}
                          className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                        >
                          <span className="text-muted-foreground">
                            {isAr ? `القسط ${item.number}` : `Installment ${item.number}`}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {item.dueDate}
                            </span>
                            <span className="font-medium">
                              <CurrencyDisplay amount={item.amount} />
                            </span>
                          </div>
                        </div>
                      ))}
                      {count > 12 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          {isAr
                            ? `...و ${count - 12} أقساط أخرى`
                            : `...and ${count - 12} more installments`}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!total || !count || !startDate}
          >
            {isAr ? "إنشاء الخطة" : "Generate Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
