"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertTriangle,
  Eye,
  GitMerge,
  Plus,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DuplicateLead } from "@/lib/types";

interface DuplicateWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateLead[];
  onCreateAnyway: () => void;
  onViewExisting: (id: string) => void;
  onMerge: (duplicate: DuplicateLead) => void;
}

export function DuplicateWarningModal({
  open,
  onOpenChange,
  duplicates,
  onCreateAnyway,
  onViewExisting,
  onMerge,
}: DuplicateWarningModalProps) {
  const t = useTranslations("leads.duplicates");
  const tStages = useTranslations("leads.stages");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {isAr ? dup.nameAr : dup.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {dup.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {dup.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {dup.phone}
                      </span>
                    </div>
                  </div>
                  <ConfidenceBadge confidence={dup.confidence} />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {tStages(dup.stage)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {t("score")}: {dup.score}
                  </span>
                  <span className="text-muted-foreground">
                    {t("lastActivity")}:{" "}
                    {new Date(dup.lastActivityAt).toLocaleDateString(
                      isAr ? "ar-SA" : "en-SA"
                    )}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onViewExisting(dup.id)}
                  >
                    <Eye className="h-3 w-3 me-1" />
                    {t("viewExisting")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onMerge(dup)}
                  >
                    <GitMerge className="h-3 w-3 me-1" />
                    {t("merge")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={onCreateAnyway}>
            <Plus className="h-4 w-4 me-1" />
            {t("createAnyway")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const t = useTranslations("leads.duplicates.confidence");

  let label: string;
  let className: string;

  if (confidence > 80) {
    label = t("high");
    className = "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
  } else if (confidence >= 50) {
    label = t("medium");
    className = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
  } else {
    label = t("low");
    className = "bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
  }

  return (
    <Badge className={cn("border-transparent text-xs", className)}>
      {confidence}% — {label}
    </Badge>
  );
}
