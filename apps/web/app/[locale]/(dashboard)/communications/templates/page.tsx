"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCard } from "@/components/communications/template-card";
import { TemplateEditor } from "@/components/communications/template-editor";
import { TemplatePreview } from "@/components/communications/template-preview";
import { SendEmailDialog } from "@/components/communications/send-email-dialog";
import { useEmailTemplates } from "@/hooks/api/use-communications";
import { mockEmailTemplates, TEMPLATE_CATEGORY_CONFIG } from "@/lib/mock-communications";
import type { EmailTemplate, TemplateCategory } from "@/lib/types";

export default function EmailTemplatesPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTemplateId, setSendTemplateId] = useState<string | undefined>();

  const { data, isLoading } = useEmailTemplates({
    category: categoryFilter !== "all" ? [categoryFilter] : undefined,
    search: search || undefined,
  });

  const templates = (data?.data || mockEmailTemplates) as EmailTemplate[];

  const handleToggleActive = useCallback((id: string, active: boolean) => {
    console.log("Toggle template active:", id, active);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditTemplateId(id);
  }, []);

  const handleSend = useCallback((id: string) => {
    setSendTemplateId(id);
    setSendDialogOpen(true);
  }, []);

  const handleCreateTemplate = useCallback((formData: Record<string, unknown>) => {
    console.log("Create template:", formData);
  }, []);

  const handleSendEmail = useCallback((formData: { templateId: string; recipientEmail: string; leadId?: string }) => {
    console.log("Send email:", formData);
  }, []);

  const editTemplate = editTemplateId
    ? templates.find((t) => t.id === editTemplateId)
    : null;
  const previewTemplate = previewTemplateId
    ? templates.find((t) => t.id === previewTemplateId)
    : templates[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? "قوالب البريد الإلكتروني" : "Email Templates"}
        subtitle={
          isAr
            ? `${templates.length} قالب`
            : `${templates.length} templates`
        }
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {isAr ? "إنشاء قالب" : "Create Template"}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث في القوالب..." : "Search templates..."}
            className="ps-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={isAr ? "الفئة" : "Category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            {(Object.keys(TEMPLATE_CATEGORY_CONFIG) as TemplateCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {isAr ? TEMPLATE_CATEGORY_CONFIG[cat].labelAr : TEMPLATE_CATEGORY_CONFIG[cat].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onSend={handleSend}
              />
            ))}
          </div>
          {templates.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <p className="text-sm text-muted-foreground">
                {isAr ? "لا توجد قوالب" : "No templates found"}
              </p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {previewTemplate && (
            <div className="sticky top-20">
              <TemplatePreview template={previewTemplate} />
            </div>
          )}
        </div>
      </div>

      {/* Create Template Dialog */}
      <TemplateEditor
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTemplate}
        mode="create"
      />

      {/* Edit Template Dialog */}
      {editTemplate && (
        <TemplateEditor
          open={!!editTemplateId}
          onOpenChange={(open) => !open && setEditTemplateId(null)}
          onSubmit={(formData) => console.log("Update template:", editTemplateId, formData)}
          initialData={{
            name: isAr ? editTemplate.nameAr : editTemplate.name,
            category: editTemplate.category,
            subject: isAr && editTemplate.subjectAr ? editTemplate.subjectAr : editTemplate.subject,
            body: isAr && editTemplate.bodyAr ? editTemplate.bodyAr : editTemplate.body,
          }}
          mode="edit"
        />
      )}

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        templateId={sendTemplateId}
        onSubmit={handleSendEmail}
      />
    </div>
  );
}
