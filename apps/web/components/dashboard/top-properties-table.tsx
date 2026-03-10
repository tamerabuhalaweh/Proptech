"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopProperties } from "@/hooks/api/use-dashboard";

export function TopPropertiesTable() {
  const t = useTranslations("dashboard.topProperties");
  const commonT = useTranslations("common");
  const locale = useLocale();

  const { data: topProperties, isLoading } = useTopProperties();

  if (isLoading) {
    return <TopPropertiesTableSkeleton />;
  }

  const properties = topProperties || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          {commonT("viewAll")}
          <ArrowRight className="ms-1 h-3 w-3 rtl:rotate-180" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("property")}</TableHead>
                <TableHead className="text-center">{t("units")}</TableHead>
                <TableHead>{t("occupancy")}</TableHead>
                <TableHead className="text-end">{t("revenue")}</TableHead>
                <TableHead className="text-end">{t("trend")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow
                  key={prop.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {locale === "ar" ? prop.nameAr : prop.name}
                  </TableCell>
                  <TableCell className="text-center">{prop.units}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={prop.occupancy}
                        className="h-1.5 w-16"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {prop.occupancy}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end font-medium">
                    {formatCurrency(
                      prop.revenue,
                      locale === "ar" ? "ar-SA" : "en-SA",
                      true
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        prop.trend >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {prop.trend >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {prop.trend >= 0 ? "+" : ""}
                      {prop.trend}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {properties.slice(0, 3).map((prop) => (
            <div
              key={prop.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {locale === "ar" ? prop.nameAr : prop.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {prop.units} {locale === "ar" ? "وحدة" : "units"}
                  </span>
                  <span>{prop.occupancy}%</span>
                </div>
              </div>
              <div className="text-end">
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    prop.revenue,
                    locale === "ar" ? "ar-SA" : "en-SA",
                    true
                  )}
                </p>
                <span
                  className={cn(
                    "text-xs font-medium",
                    prop.trend >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {prop.trend >= 0 ? "+" : ""}
                  {prop.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopPropertiesTableSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-1.5 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
