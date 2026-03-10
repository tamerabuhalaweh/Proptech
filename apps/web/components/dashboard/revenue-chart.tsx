"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useRevenueData } from "@/hooks/api/use-dashboard";

export function RevenueChart() {
  const t = useTranslations("dashboard.charts");
  const locale = useLocale();
  const [period, setPeriod] = React.useState<"monthly" | "quarterly">(
    "monthly"
  );

  const { data: revenueData, isLoading } = useRevenueData();

  if (isLoading) {
    return <RevenueChartSkeleton />;
  }

  const data = (revenueData || []).map((d: { month: string; monthAr: string; revenue: number; previousPeriod: number }) => ({
    name: locale === "ar" ? d.monthAr : d.month,
    revenue: d.revenue,
    previousPeriod: d.previousPeriod,
  }));

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          {t("revenueTrend")}
        </CardTitle>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as "monthly" | "quarterly")}
        >
          <TabsList className="h-8">
            <TabsTrigger value="monthly" className="text-xs px-3 h-6">
              {t("monthly")}
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs px-3 h-6">
              {t("quarterly")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.35 0.08 250)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.35 0.08 250)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={50}
                orientation={locale === "ar" ? "right" : "left"}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-sm text-primary font-semibold">
                        {formatCurrency(
                          payload[0].value as number,
                          locale === "ar" ? "ar-SA" : "en-SA"
                        )}
                      </p>
                      {payload[1] && (
                        <p className="text-xs text-muted-foreground">
                          {locale === "ar" ? "الفترة السابقة: " : "Previous: "}
                          {formatCurrency(
                            payload[1].value as number,
                            locale === "ar" ? "ar-SA" : "en-SA"
                          )}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.35 0.08 250)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="previousPeriod"
                stroke="oklch(0.68 0.015 260)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fillOpacity={0}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueChartSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
