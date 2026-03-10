"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { GitMerge, ArrowRight } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lead, DuplicateLead, MergeFieldChoice } from "@/lib/types";

interface MergeLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLead: {
    name: string;
    nameAr: string;
    phone: string;
    email?: string;
  };
  sourceLead: DuplicateLead;
  onConfirmMerge: (fields: Record<string, "target" | "source">) => void;
}

const MERGE_FIELDS = [
  { field: "name", labelKey: "name" },
  { field: "nameAr", labelKey: "nameAr" },
  { field: "phone", labelKey: "phone" },
  { field: "email", labelKey: "email" },
];

export function MergeLeadsDialog({
  open,
  onOpenChange,
  targetLead,
  sourceLead,
  onConfirmMerge,
}: MergeLeadsDialogProps) {
  const t = useTranslations("leads.merge");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [selections, setSelections] = useState<Record<string, "target" | "source">>({
    name: "target",
    nameAr: "target",
    phone: "target",
    email: "target",
  });

  const fieldPairs = useMemo(() => {
    const tl = targetLead as unknown as Record<string, string | undefined>;
    const sl = sourceLead as unknown as Record<string, string | undefined>;
    return MERGE_FIELDS.map((f) => ({
      ...f,
      targetValue: tl[f.field] || "—",
      sourceValue: sl[f.field] || "—",
    }));
  }, [targetLead, sourceLead]);

  const mergedPreview = useMemo(() => {
    const tl = targetLead as unknown as Record<string, string | undefined>;
    const sl = sourceLead as unknown as Record<string, string | undefined>;
    const result: Record<string, string> = {};
    for (const f of MERGE_FIELDS) {
      const selected = selections[f.field] || "target";
      result[f.field] = selected === "target" ? (tl[f.field] || "—") : (sl[f.field] || "—");
    }
    return result;
  }, [selections, targetLead, sourceLead]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground">
              <div className="text-center">{t("newLead")}</div>
              <div />
              <div className="text-center">{t("existingLead")}</div>
            </div>

            {/* Side-by-side comparison */}
            {fieldPairs.map((fp) => (
              <div key={fp.field} className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t(`fields.${fp.labelKey}`)}
                </Label>
                <RadioGroup
                  value={selections[fp.field]}
                  onValueChange={(v) =>
                    setSelections((prev) => ({
                      ...prev,
                      [fp.field]: v as "target" | "source",
                    }))
                  }
                  className="grid grid-cols-3 gap-3"
                >
                  {/* Target */}
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-2 cursor-pointer text-sm",
                      selections[fp.field] === "target" && "ring-2 ring-primary bg-accent"
                    )}
                  >
                    <RadioGroupItem value="target" />
                    <span className="truncate" dir={fp.field === "nameAr" ? "rtl" : undefined}>
                      {fp.targetValue}
                    </span>
                  </label>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                  </div>

                  {/* Source */}
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-2 cursor-pointer text-sm",
                      selections[fp.field] === "source" && "ring-2 ring-primary bg-accent"
                    )}
                  >
                    <RadioGroupItem value="source" />
                    <span className="truncate" dir={fp.field === "nameAr" ? "rtl" : undefined}>
                      {fp.sourceValue}
                    </span>
                  </label>
                </RadioGroup>
              </div>
            ))}

            <Separator />

            {/* Merged Preview */}
            <div>
              <h4 className="text-sm font-semibold mb-2">{t("preview")}</h4>
              <Card>
                <CardContent className="p-3 space-y-1">
                  {MERGE_FIELDS.map((f) => (
                    <div key={f.field} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t(`fields.${f.labelKey}`)}</span>
                      <span
                        className="font-medium"
                        dir={f.field === "nameAr" ? "rtl" : undefined}
                      >
                        {mergedPreview[f.field]}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={() => onConfirmMerge(selections)}>
            <GitMerge className="h-4 w-4 me-1" />
            {t("confirmMerge")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
