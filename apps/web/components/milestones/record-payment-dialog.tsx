"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethod } from "@/lib/types";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneName?: string;
  milestoneAmount?: number;
  onSubmit?: (data: { method: PaymentMethod; receiptNumber?: string; notes?: string }) => void;
}

const paymentMethods: { value: PaymentMethod; label: string; labelAr: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer", labelAr: "تحويل بنكي" },
  { value: "cash", label: "Cash", labelAr: "نقدي" },
  { value: "cheque", label: "Cheque", labelAr: "شيك" },
  { value: "credit_card", label: "Credit Card", labelAr: "بطاقة ائتمان" },
  { value: "other", label: "Other", labelAr: "أخرى" },
];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  milestoneName,
  milestoneAmount,
  onSubmit,
}: RecordPaymentDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit?.({
      method,
      receiptNumber: receiptNumber || undefined,
      notes: notes || undefined,
    });
    setMethod("bank_transfer");
    setReceiptNumber("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "تسجيل دفعة" : "Record Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {milestoneName && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm font-medium">{milestoneName}</p>
              {milestoneAmount && (
                <p className="text-xs text-muted-foreground">
                  {isAr ? "المبلغ:" : "Amount:"} {milestoneAmount.toLocaleString()} {isAr ? "ر.س" : "SAR"}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{isAr ? "طريقة الدفع" : "Payment Method"}</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {isAr ? pm.labelAr : pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "رقم الإيصال" : "Receipt Number"}</Label>
            <Input
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder={isAr ? "مثال: RCP-2024-001" : "e.g., RCP-2024-001"}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? "ملاحظات إضافية" : "Additional notes"}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit}>
            {isAr ? "تسجيل الدفعة" : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
