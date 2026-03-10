"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { MilestoneCard } from "./milestone-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";
import type { Milestone, MilestoneStatus } from "@/lib/types";

const statusIcons: Record<MilestoneStatus, typeof Circle> = {
  paid: CheckCircle2,
  due: Clock,
  overdue: AlertCircle,
  upcoming: Circle,
  cancelled: Circle,
};

const statusColors: Record<MilestoneStatus, string> = {
  paid: "text-emerald-500 dark:text-emerald-400",
  due: "text-amber-500 dark:text-amber-400",
  overdue: "text-red-500 dark:text-red-400",
  upcoming: "text-muted-foreground",
  cancelled: "text-gray-400 dark:text-gray-600",
};

const lineColors: Record<MilestoneStatus, string> = {
  paid: "bg-emerald-300 dark:bg-emerald-700",
  due: "bg-amber-300 dark:bg-amber-700",
  overdue: "bg-red-300 dark:bg-red-700",
  upcoming: "bg-border",
  cancelled: "bg-border",
};

interface MilestoneTimelineProps {
  milestones: Milestone[];
  loading?: boolean;
  onRecordPayment?: (id: string) => void;
}

export function MilestoneTimeline({
  milestones,
  loading,
  onRecordPayment,
}: MilestoneTimelineProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد مراحل" : "No milestones yet"}
        </p>
      </div>
    );
  }

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="relative">
      {sortedMilestones.map((milestone, index) => {
        const Icon = statusIcons[milestone.status];
        const isLast = index === sortedMilestones.length - 1;

        return (
          <div key={milestone.id} className="flex gap-4 pb-6 last:pb-0">
            {/* Timeline node */}
            <div className="flex flex-col items-center">
              <div className={cn("shrink-0", statusColors[milestone.status])}>
                <Icon className="h-6 w-6" />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 mt-2",
                    lineColors[milestone.status]
                  )}
                />
              )}
            </div>

            {/* Milestone card */}
            <div className="flex-1 pb-2">
              <MilestoneCard
                milestone={milestone}
                onRecordPayment={onRecordPayment}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
