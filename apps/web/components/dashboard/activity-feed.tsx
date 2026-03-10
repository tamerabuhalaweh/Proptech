"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Users,
  CreditCard,
  Clock,
  AlertTriangle,
  Building2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardActivity } from "@/hooks/api/use-dashboard";

const typeConfig = {
  lead: { icon: Users, color: "bg-info", dotColor: "bg-blue-500" },
  payment: { icon: CreditCard, color: "bg-success", dotColor: "bg-green-500" },
  lease: { icon: Clock, color: "bg-warning", dotColor: "bg-amber-500" },
  maintenance: {
    icon: AlertTriangle,
    color: "bg-destructive",
    dotColor: "bg-red-500",
  },
  property: {
    icon: Building2,
    color: "bg-muted",
    dotColor: "bg-gray-400",
  },
};

function formatTimeAgo(timestamp: string, locale: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === "ar") {
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} د`;
    if (hours < 24) return `منذ ${hours} س`;
    return `منذ ${days} ي`;
  }

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function ActivityFeed() {
  const t = useTranslations("dashboard.activity");
  const locale = useLocale();

  const { data: activities, isLoading } = useDashboardActivity();

  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  const activityList = activities || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-1">
          {activityList.map((activity) => {
            const config =
              typeConfig[activity.type as keyof typeof typeConfig] ||
              typeConfig.property;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <div
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    config.dotColor
                  )}
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium leading-tight">
                    {locale === "ar" ? activity.titleAr : activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {locale === "ar"
                      ? activity.descriptionAr
                      : activity.description}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                  {formatTimeAgo(activity.timestamp, locale)}
                </time>
              </div>
            );
          })}
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {t("viewAll")}
          <ArrowRight className="ms-1 h-3 w-3 rtl:rotate-180" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 p-2">
              <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
