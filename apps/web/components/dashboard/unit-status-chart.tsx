"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnitStatusData } from "@/hooks/api/use-dashboard";

export function UnitStatusChart() {
  const t = useTranslations("dashboard.charts");
  const statusT = useTranslations("unitStatus");
  const locale = useLocale();

  const { data: unitStatusData, isLoading } = useUnitStatusData();

  if (isLoading) {
    return <UnitStatusChartSkeleton />;
  }

  const statusData = unitStatusData || [];
  const totalUnits = statusData.reduce((sum: number, d: { count: number }) => sum + d.count, 0);

  const data = statusData.map((d: { status: string; count: number; color: string }) => ({
    name: statusT(d.status),
    value: d.count,
    color: d.color,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("unitStatus")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="relative h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry: { color: string }, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <p className="text-sm font-medium">
                        {item.name}: {item.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(
                          ((item.value as number) / totalUnits) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{totalUnits}</span>
            <span className="text-xs text-muted-foreground">
              {t("totalUnits")}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item: { name: string; value: number; color: string }) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {item.name}
              </span>
              <span className="ms-auto text-xs font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UnitStatusChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full rounded-full mx-auto max-w-[200px]" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
