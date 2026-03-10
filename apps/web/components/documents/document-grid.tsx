"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { DocumentCard } from "./document-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DateDisplay } from "@/components/common/date-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOCUMENT_CATEGORY_CONFIG } from "@/lib/mock-documents";
import type { Document } from "@/lib/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentGridProps {
  documents: Document[];
  loading?: boolean;
  viewMode: "grid" | "list";
  onDocumentClick: (id: string) => void;
  onArchiveToggle?: (id: string, archive: boolean) => void;
}

export function DocumentGrid({
  documents,
  loading,
  viewMode,
  onDocumentClick,
  onArchiveToggle,
}: DocumentGridProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading) {
    return viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد مستندات" : "No documents found"}
        </p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onClick={onDocumentClick}
            onArchiveToggle={onArchiveToggle}
          />
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isAr ? "المستند" : "Document"}</TableHead>
            <TableHead>{isAr ? "الفئة" : "Category"}</TableHead>
            <TableHead>{isAr ? "الكيان" : "Entity"}</TableHead>
            <TableHead>{isAr ? "الحجم" : "Size"}</TableHead>
            <TableHead>{isAr ? "بواسطة" : "Uploaded By"}</TableHead>
            <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const catConfig = DOCUMENT_CATEGORY_CONFIG[doc.category];
            return (
              <TableRow
                key={doc.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  doc.isArchived && "opacity-60"
                )}
                onClick={() => onDocumentClick(doc.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{catConfig.emoji}</span>
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {isAr && doc.nameAr ? doc.nameAr : doc.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent text-xs", catConfig.bgClass, catConfig.color)}>
                    {isAr ? catConfig.labelAr : catConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {isAr && doc.entityNameAr ? doc.entityNameAr : doc.entityName || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatFileSize(doc.fileSize)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {isAr && doc.uploadedBy.nameAr ? doc.uploadedBy.nameAr : doc.uploadedBy.name}
                </TableCell>
                <TableCell>
                  <DateDisplay date={doc.createdAt} showRelative />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
