"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  label: string;
  value: string | number;
  formattedValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  loading?: boolean;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  formattedValue,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  loading,
  onClick,
}: KPICardProps) {
  const t = useTranslations();

  if (loading) {
    return <KPICardSkeleton />;
  }

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend?.direction === "up"
      ? "text-success"
      : trend?.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
              {t(label)}
            </p>
            <p className="text-2xl font-bold tracking-tight md:text-3xl">
              {formattedValue ?? value}
            </p>
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span className="font-medium">
                  {trend.direction === "up" ? "+" : ""}
                  {trend.value}%
                </span>
                {trend.label && (
                  <span className="text-muted-foreground">
                    {t(trend.label)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-muted md:h-12 md:w-12",
              iconColor
            )}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg md:h-12 md:w-12" />
        </div>
      </CardContent>
    </Card>
  );
}
