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

interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; amount: number; dueDate: string; description?: string }) => void;
}

export function AddMilestoneDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddMilestoneDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit?.({
      name,
      amount: parseFloat(amount),
      dueDate,
      description: description || undefined,
    });
    setName("");
    setAmount("");
    setDueDate("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "إضافة مرحلة" : "Add Milestone"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isAr ? "اسم المرحلة" : "Milestone Name"}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "مثال: القسط الأول" : "e.g., 1st Installment"}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "المبلغ (ر.س)" : "Amount (SAR)"}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "تاريخ الاستحقاق" : "Due Date"}</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "الوصف (اختياري)" : "Description (optional)"}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "تفاصيل إضافية" : "Additional details"}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !amount || !dueDate}>
            {isAr ? "إضافة" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
