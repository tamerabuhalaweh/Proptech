"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Plus, X } from "lucide-react";
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
import { DOCUMENT_CATEGORY_CONFIG } from "@/lib/mock-documents";
import type { DocumentCategory, DocumentEntityType } from "@/lib/types";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: Record<string, unknown>) => void;
}

const entityTypes: { value: DocumentEntityType; label: string; labelAr: string }[] = [
  { value: "property", label: "Property", labelAr: "عقار" },
  { value: "unit", label: "Unit", labelAr: "وحدة" },
  { value: "booking", label: "Booking", labelAr: "حجز" },
  { value: "lead", label: "Lead", labelAr: "عميل" },
];

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onSubmit,
}: UploadDocumentDialogProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);

  const handleAddUrl = () => {
    setUrls((prev) => [...prev, ""]);
  };

  const handleRemoveUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  };

  const handleSubmit = () => {
    const validUrls = urls.filter((u) => u.trim());
    onSubmit?.({
      name,
      category,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      description: description || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      urls: validUrls,
    });
    // Reset
    setName("");
    setCategory("other");
    setEntityType("");
    setEntityId("");
    setDescription("");
    setTags("");
    setUrls([""]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "رفع مستند" : "Upload Document"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{isAr ? "اسم المستند" : "Document Name"}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? "أدخل اسم المستند" : "Enter document name"}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "الفئة" : "Category"}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {DOCUMENT_CATEGORY_CONFIG[cat].emoji}{" "}
                      {isAr ? DOCUMENT_CATEGORY_CONFIG[cat].labelAr : DOCUMENT_CATEGORY_CONFIG[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isAr ? "نوع الكيان" : "Entity Type"}</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? "اختر (اختياري)" : "Select (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((et) => (
                    <SelectItem key={et.value} value={et.value}>
                      {isAr ? et.labelAr : et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {entityType && (
            <div className="space-y-2">
              <Label>{isAr ? "معرّف الكيان" : "Entity ID"}</Label>
              <Input
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder={isAr ? "أدخل معرّف الكيان" : "Enter entity ID"}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{isAr ? "الوصف" : "Description"}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isAr ? "وصف اختياري" : "Optional description"}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "الوسوم" : "Tags"}</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={isAr ? "فصل بفاصلة: عقد, موقع" : "Comma-separated: contract, signed"}
            />
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{isAr ? "روابط الملفات" : "File URLs"}</Label>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleAddUrl}>
                <Plus className="h-3 w-3 me-1" />
                {isAr ? "إضافة رابط" : "Add URL"}
              </Button>
            </div>
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                {urls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleRemoveUrl(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || urls.every((u) => !u.trim())}
          >
            {isAr ? "رفع" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
