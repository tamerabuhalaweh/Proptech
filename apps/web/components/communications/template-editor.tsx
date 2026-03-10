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
import { Badge } from "@/components/ui/badge";
import { TEMPLATE_CATEGORY_CONFIG } from "@/lib/mock-communications";
import type { TemplateCategory } from "@/lib/types";

const TEMPLATE_VARIABLES = [
  { key: "leadName", label: "Lead Name", labelAr: "اسم العميل" },
  { key: "propertyName", label: "Property Name", labelAr: "اسم العقار" },
  { key: "unitNumber", label: "Unit Number", labelAr: "رقم الوحدة" },
  { key: "bookingId", label: "Booking ID", labelAr: "رقم الحجز" },
  { key: "amount", label: "Amount", labelAr: "المبلغ" },
  { key: "dueDate", label: "Due Date", labelAr: "تاريخ الاستحقاق" },
  { key: "agentName", label: "Agent Name", labelAr: "اسم الوكيل" },
];

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: Record<string, unknown>) => void;
  initialData?: {
    name?: string;
    category?: TemplateCategory;
    subject?: string;
    body?: string;
  };
  mode?: "create" | "edit";
}

export function TemplateEditor({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: TemplateEditorProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState<TemplateCategory>(initialData?.category || "general");
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [body, setBody] = useState(initialData?.body || "");

  const insertVariable = (varKey: string) => {
    setBody((prev) => prev + `{{${varKey}}}`);
  };

  const handleSubmit = () => {
    onSubmit?.({ name, category, subject, body });
    if (mode === "create") {
      setName("");
      setCategory("general");
      setSubject("");
      setBody("");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? (isAr ? "إنشاء قالب" : "Create Template")
              : (isAr ? "تعديل القالب" : "Edit Template")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "اسم القالب" : "Template Name"}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "مثال: رسالة ترحيب" : "e.g., Welcome Email"}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الفئة" : "Category"}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TEMPLATE_CATEGORY_CONFIG) as TemplateCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {isAr ? TEMPLATE_CATEGORY_CONFIG[cat].labelAr : TEMPLATE_CATEGORY_CONFIG[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "الموضوع" : "Subject"}</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={isAr ? "موضوع البريد الإلكتروني" : "Email subject line"}
            />
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "يمكنك استخدام المتغيرات مثل {{leadName}}"
                : "You can use variables like {{leadName}}"}
            </p>
          </div>

          {/* Variable Toolbar */}
          <div className="space-y-2">
            <Label>{isAr ? "إدراج متغير" : "Insert Variable"}</Label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((v) => (
                <Button
                  key={v.key}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => insertVariable(v.key)}
                >
                  {`{{${v.key}}}`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "محتوى الرسالة" : "Body"}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isAr ? "اكتب محتوى القالب هنا..." : "Write your template body here..."}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !subject || !body}>
            {mode === "create"
              ? (isAr ? "إنشاء" : "Create")
              : (isAr ? "حفظ التغييرات" : "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
