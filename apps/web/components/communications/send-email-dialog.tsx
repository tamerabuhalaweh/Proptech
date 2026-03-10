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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockEmailTemplates } from "@/lib/mock-communications";
import type { EmailTemplate } from "@/lib/types";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSubmit?: (data: { templateId: string; recipientEmail: string; leadId?: string }) => void;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  templateId: initialTemplateId,
  onSubmit,
}: SendEmailDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [templateId, setTemplateId] = useState(initialTemplateId || "");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [leadId, setLeadId] = useState("");

  const selectedTemplate = mockEmailTemplates.find((t) => t.id === templateId);

  const handleSubmit = () => {
    if (!templateId || !recipientEmail) return;
    onSubmit?.({ templateId, recipientEmail, leadId: leadId || undefined });
    setRecipientEmail("");
    setLeadId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "إرسال بريد إلكتروني" : "Send Email"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isAr ? "القالب" : "Template"}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر قالب" : "Select template"} />
              </SelectTrigger>
              <SelectContent>
                {mockEmailTemplates
                  .filter((t) => t.isActive)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {isAr ? t.nameAr : t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium">
                {isAr ? "الموضوع:" : "Subject:"}{" "}
                {isAr && selectedTemplate.subjectAr ? selectedTemplate.subjectAr : selectedTemplate.subject}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>{isAr ? "البريد الإلكتروني للمستلم" : "Recipient Email"}</Label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {isAr ? "ربط بعميل (اختياري)" : "Link to Lead (optional)"}
            </Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "اختر عميل" : "Select lead"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead_1">Mohammed Al-Harbi</SelectItem>
                <SelectItem value="lead_2">Khalid Al-Rashidi</SelectItem>
                <SelectItem value="lead_3">Fahad Al-Shammari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={!templateId || !recipientEmail}>
            {isAr ? "إرسال" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
