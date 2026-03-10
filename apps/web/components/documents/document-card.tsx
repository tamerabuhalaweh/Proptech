"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, ExternalLink } from "lucide-react";
import { DateDisplay } from "@/components/common/date-display";
import { DOCUMENT_CATEGORY_CONFIG } from "@/lib/mock-documents";
import type { Document } from "@/lib/types";

interface DocumentCardProps {
  document: Document;
  onClick?: (id: string) => void;
  onArchiveToggle?: (id: string, archive: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({
  document: doc,
  onClick,
  onArchiveToggle,
}: DocumentCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const categoryConfig = DOCUMENT_CATEGORY_CONFIG[doc.category];

  return (
    <Card
      className={cn(
        "group cursor-pointer hover:shadow-md transition-shadow",
        doc.isArchived && "opacity-60"
      )}
      onClick={() => onClick?.(doc.id)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl shrink-0">{categoryConfig.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {isAr && doc.nameAr ? doc.nameAr : doc.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(doc.fileSize)}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "border-transparent font-medium text-[10px] shrink-0",
              categoryConfig.bgClass,
              categoryConfig.color
            )}
          >
            {isAr ? categoryConfig.labelAr : categoryConfig.label}
          </Badge>
        </div>

        {doc.entityName && (
          <p className="text-xs text-muted-foreground truncate">
            {isAr && doc.entityNameAr ? doc.entityNameAr : doc.entityName}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isAr ? "بواسطة" : "By"}{" "}
            {isAr && doc.uploadedBy.nameAr ? doc.uploadedBy.nameAr : doc.uploadedBy.name}
          </span>
          <DateDisplay date={doc.createdAt} showRelative />
        </div>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions - visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.open(doc.url, "_blank");
            }}
          >
            <ExternalLink className="h-3 w-3 me-1" />
            {isAr ? "فتح" : "Open"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onArchiveToggle?.(doc.id, !doc.isArchived);
            }}
          >
            {doc.isArchived ? (
              <>
                <ArchiveRestore className="h-3 w-3 me-1" />
                {isAr ? "استعادة" : "Unarchive"}
              </>
            ) : (
              <>
                <Archive className="h-3 w-3 me-1" />
                {isAr ? "أرشفة" : "Archive"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
