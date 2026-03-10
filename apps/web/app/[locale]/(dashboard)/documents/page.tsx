"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { DocumentGrid } from "@/components/documents/document-grid";
import { DocumentFilters } from "@/components/documents/document-filters";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { DocumentDetail } from "@/components/documents/document-detail";
import { useDocuments } from "@/hooks/api/use-documents";
import { mockDocuments } from "@/lib/mock-documents";
import type { Document } from "@/lib/types";

export default function DocumentsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useDocuments({
    category: categoryFilter !== "all" ? [categoryFilter] : undefined,
    entityType: entityTypeFilter !== "all" ? [entityTypeFilter] : undefined,
    search: search || undefined,
    isArchived: showArchived ? undefined : false,
  });

  const documents = (data?.data || mockDocuments.filter((d) => showArchived || !d.isArchived)) as Document[];

  const handleDocumentClick = useCallback((id: string) => {
    setSelectedDocId(id);
    setDetailOpen(true);
  }, []);

  const handleArchiveToggle = useCallback((id: string, archive: boolean) => {
    console.log("Archive toggle:", id, archive);
  }, []);

  const handleUpload = useCallback((formData: Record<string, unknown>) => {
    console.log("Upload document:", formData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? "مركز المستندات" : "Document Center"}
        subtitle={
          isAr
            ? `${documents.length} مستند`
            : `${documents.length} documents`
        }
        actions={
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {isAr ? "رفع مستند" : "Upload Document"}
          </Button>
        }
      />

      <DocumentFilters
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        entityTypeFilter={entityTypeFilter}
        onEntityTypeFilterChange={setEntityTypeFilter}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <DocumentGrid
        documents={documents}
        loading={isLoading}
        viewMode={viewMode}
        onDocumentClick={handleDocumentClick}
        onArchiveToggle={handleArchiveToggle}
      />

      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUpload}
      />

      <DocumentDetail
        documentId={selectedDocId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onArchiveToggle={handleArchiveToggle}
      />
    </div>
  );
}
