"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DateDisplay } from "@/components/common/date-display";
import { ExternalLink, Archive, ArchiveRestore } from "lucide-react";
import { mockDocuments, DOCUMENT_CATEGORY_CONFIG } from "@/lib/mock-documents";
import type { Document } from "@/lib/types";

interface DocumentDetailProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchiveToggle?: (id: string, archive: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetail({
  documentId,
  open,
  onOpenChange,
  onArchiveToggle,
}: DocumentDetailProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const doc = documentId ? mockDocuments.find((d) => d.id === documentId) : null;
  if (!doc) return null;

  const catConfig = DOCUMENT_CATEGORY_CONFIG[doc.category];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-xl">{catConfig.emoji}</span>
            <span className="truncate">
              {isAr && doc.nameAr ? doc.nameAr : doc.name}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border-transparent", catConfig.bgClass, catConfig.color)}>
              {isAr ? catConfig.labelAr : catConfig.label}
            </Badge>
            {doc.isArchived && (
              <Badge variant="outline" className="text-muted-foreground">
                {isAr ? "مؤرشف" : "Archived"}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <DetailRow
              label={isAr ? "الحجم" : "File Size"}
              value={formatFileSize(doc.fileSize)}
            />
            {doc.mimeType && (
              <DetailRow label={isAr ? "النوع" : "Type"} value={doc.mimeType} />
            )}
            <DetailRow
              label={isAr ? "رفع بواسطة" : "Uploaded By"}
              value={isAr && doc.uploadedBy.nameAr ? doc.uploadedBy.nameAr : doc.uploadedBy.name}
            />
            <DetailRow
              label={isAr ? "تاريخ الرفع" : "Upload Date"}
              value={<DateDisplay date={doc.createdAt} format="long" />}
            />
          </div>

          {/* Description */}
          {(doc.description || doc.descriptionAr) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  {isAr ? "الوصف" : "Description"}
                </h4>
                <p className="text-sm">
                  {isAr && doc.descriptionAr ? doc.descriptionAr : doc.description}
                </p>
              </div>
            </>
          )}

          {/* Entity */}
          {doc.entityName && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                  {isAr ? "مرتبط بـ" : "Linked To"}
                </h4>
                <p className="text-sm">
                  {isAr && doc.entityNameAr ? doc.entityNameAr : doc.entityName}
                </p>
                {doc.entityType && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {doc.entityType}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Tags */}
          {doc.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  {isAr ? "الوسوم" : "Tags"}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => window.open(doc.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4 me-2" />
              {isAr ? "فتح الملف" : "Open File"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onArchiveToggle?.(doc.id, !doc.isArchived)}
            >
              {doc.isArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 me-1" />
                  {isAr ? "استعادة" : "Unarchive"}
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 me-1" />
                  {isAr ? "أرشفة" : "Archive"}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
