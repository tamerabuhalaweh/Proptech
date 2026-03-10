"use client";

import { useLocale } from "next-intl";
import {
  Phone,
  Mail,
  Calendar,
  StickyNote,
  RefreshCw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import type { LeadActivity, ActivityType } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const activityIcons: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
  status_change: RefreshCw,
  system: Settings,
};

const activityColors: Record<ActivityType, string> = {
  call: "text-green-600 bg-green-100 dark:bg-green-900/30",
  email: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  meeting: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  note: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  status_change: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
  system: "text-gray-500 bg-gray-100 dark:bg-gray-800/30",
};

interface ActivityTimelineProps {
  activities: LeadActivity[];
  loading?: boolean;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {isAr ? "لا يوجد نشاط مسجل" : "No activity recorded"}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute top-0 bottom-0 start-4 w-px bg-border" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || Settings;
          const colorClasses = activityColors[activity.type] || activityColors.system;
          const isSystem = activity.type === "system" || activity.type === "status_change";
          const timeAgo = (() => {
            try {
              return formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
            } catch {
              return "";
            }
          })();

          return (
            <div key={activity.id} className="relative flex gap-3 ps-0">
              {/* Icon circle */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  colorClasses
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {isAr ? activity.titleAr : activity.title}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
                </div>
                {(activity.description || activity.descriptionAr) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAr ? activity.descriptionAr : activity.description}
                  </p>
                )}
                {!isSystem && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px]">
                        {getInitials(activity.actor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{isAr ? activity.actor.nameAr || activity.actor.name : activity.actor.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
