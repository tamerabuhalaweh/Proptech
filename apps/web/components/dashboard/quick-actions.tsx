"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  Users,
  BarChart3,
  Grid3X3,
  Calendar,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function QuickActions() {
  const t = useTranslations("dashboard.quickActions");
  const ut = useTranslations("dashboard.upcoming");
  const locale = useLocale();

  const actions = [
    { label: t("addProperty"), icon: Building2 },
    { label: t("newLead"), icon: Users },
    { label: t("generateReport"), icon: BarChart3 },
    { label: t("viewInventory"), icon: Grid3X3 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4 text-xs font-medium"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                {action.label}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div>
          <h4 className="text-sm font-semibold mb-3">
            {ut("title")}
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ut("leaseRenewals", { count: "3" })}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {ut("propertyVisits", { count: "5" })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
