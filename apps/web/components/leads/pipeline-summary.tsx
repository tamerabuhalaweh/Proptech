"use client";

import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { STAGE_COLORS } from "@/lib/mock-leads";
import type { PipelineSummary as PipelineSummaryType, LeadStage } from "@/lib/types";

interface PipelineSummaryProps {
  data?: PipelineSummaryType;
  loading?: boolean;
  onStageClick?: (stage: LeadStage) => void;
  activeStage?: LeadStage | null;
}

export function PipelineSummary({ data, loading, onStageClick, activeStage }: PipelineSummaryProps) {
  const t = useTranslations("leads");
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading || !data) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-28 shrink-0 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {data.stages.map((stage, i) => (
          <button
            key={stage.stage}
            onClick={() => onStageClick?.(stage.stage)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors shrink-0",
              "hover:bg-muted/80",
              activeStage === stage.stage && "ring-2 ring-primary",
              !activeStage && "bg-muted/50"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full shrink-0", STAGE_COLORS[stage.stage as LeadStage])} />
            <span>{t(`stages.${stage.stage}`)}</span>
            <span className="text-muted-foreground">({stage.count})</span>
            {i < data.stages.length - 1 && (
              <span className="text-muted-foreground ms-1">→</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
        <span>
          {t("conversionRate")}:{" "}
          <span className="font-semibold text-foreground">{data.conversionRate}%</span>
        </span>
        <span>
          {t("avgDaysToClose")}:{" "}
          <span className="font-semibold text-foreground">
            {data.avgDaysToClose} {t("days")}
          </span>
        </span>
        <span>
          {t("totalActive")}:{" "}
          <span className="font-semibold text-foreground">{data.activeLeads}</span>
        </span>
      </div>
    </div>
  );
}
