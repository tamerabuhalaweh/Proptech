"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
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
import { COMMUNICATION_TYPE_CONFIG } from "@/lib/mock-communications";
import type { CommunicationType } from "@/lib/types";

interface NewCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export function NewCommunicationDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewCommunicationDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [type, setType] = useState<CommunicationType>("email");
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    onSubmit?.({
      type,
      direction: "outbound",
      contact: { name: contactName, email: type === "email" ? contactInfo : undefined, phone: type !== "email" ? contactInfo : undefined },
      subject,
      body,
    });
    // Reset form
    setType("email");
    setContactName("");
    setContactInfo("");
    setSubject("");
    setBody("");
    onOpenChange(false);
  };

  const contactInfoLabel = type === "email"
    ? (isAr ? "البريد الإلكتروني" : "Email")
    : (isAr ? "رقم الهاتف" : "Phone Number");

  const contactInfoPlaceholder = type === "email" ? "name@example.com" : "+966...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "اتصال جديد" : "New Communication"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>{isAr ? "النوع" : "Type"}</Label>
            <Select value={type} onValueChange={(v) => setType(v as CommunicationType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COMMUNICATION_TYPE_CONFIG) as CommunicationType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {COMMUNICATION_TYPE_CONFIG[t].emoji}{" "}
                    {isAr ? COMMUNICATION_TYPE_CONFIG[t].labelAr : COMMUNICATION_TYPE_CONFIG[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <Label>{isAr ? "اسم جهة الاتصال" : "Contact Name"}</Label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={isAr ? "أدخل اسم جهة الاتصال" : "Enter contact name"}
            />
          </div>

          {/* Contact Info */}
          {type !== "note" && (
            <div className="space-y-2">
              <Label>{contactInfoLabel}</Label>
              <Input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={contactInfoPlaceholder}
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label>{isAr ? "الموضوع" : "Subject"}</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={isAr ? "أدخل الموضوع" : "Enter subject"}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label>{isAr ? "المحتوى" : "Message"}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={!contactName || !subject}>
            {type === "note"
              ? (isAr ? "حفظ" : "Save")
              : (isAr ? "إرسال" : "Send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
