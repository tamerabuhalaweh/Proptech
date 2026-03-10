"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  PieChart,
  TrendingUp,
  Users,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { KPICard } from "@/components/common/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { UnitStatusChart } from "@/components/dashboard/unit-status-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TopPropertiesTable } from "@/components/dashboard/top-properties-table";
import { Button } from "@/components/ui/button";
import { formatCurrency, getGreeting } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/api/use-dashboard";
import { mockUser } from "@/lib/mock-data";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const greeting = getGreeting(new Date().getHours());
  const userName = locale === "ar" ? mockUser.nameAr : mockUser.name;

  const { data: kpis, isLoading: kpisLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        subtitle={t(`greeting.${greeting}`, { name: userName })}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              {locale === "ar" ? "تصدير" : "Export"}
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            label="dashboard.kpi.totalProperties"
            value={kpis?.totalProperties.value ?? 0}
            icon={Building2}
            iconColor="text-primary"
            trend={kpis ? {
              value: kpis.totalProperties.changePercent,
              direction: kpis.totalProperties.change >= 0 ? "up" : "down",
              label: "dashboard.kpi.thisMonth",
            } : undefined}
            loading={kpisLoading}
          />
          <KPICard
            label="dashboard.kpi.occupancyRate"
            value={kpis?.occupancyRate.value ?? 0}
            formattedValue={kpis ? `${kpis.occupancyRate.value}%` : undefined}
            icon={PieChart}
            iconColor="text-info"
            trend={kpis ? {
              value: kpis.occupancyRate.changePercent,
              direction: kpis.occupancyRate.change >= 0 ? "up" : "down",
              label: "dashboard.kpi.vsLastMonth",
            } : undefined}
            loading={kpisLoading}
          />
          <KPICard
            label="dashboard.kpi.revenueMTD"
            value={kpis?.revenueMTD.value ?? 0}
            formattedValue={
              kpis
                ? formatCurrency(
                    kpis.revenueMTD.value,
                    locale === "ar" ? "ar-SA" : "en-SA",
                    true
                  )
                : undefined
            }
            icon={TrendingUp}
            iconColor="text-success"
            trend={kpis ? {
              value: kpis.revenueMTD.changePercent,
              direction: kpis.revenueMTD.change >= 0 ? "up" : "down",
              label: "dashboard.kpi.vsLastMonth",
            } : undefined}
            loading={kpisLoading}
          />
          <KPICard
            label="dashboard.kpi.activeLeads"
            value={kpis?.activeLeads.value ?? 0}
            icon={Users}
            iconColor="text-warning"
            trend={kpis ? {
              value: kpis.activeLeads.newThisWeek,
              direction: "up",
              label: "dashboard.kpi.newThisWeek",
            } : undefined}
            loading={kpisLoading}
          />
        </div>
      </section>

      {/* Charts Row */}
      <section aria-label="Charts" className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <UnitStatusChart />
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <section className="grid gap-4 lg:grid-cols-2">
        <ActivityFeed />
        <QuickActions />
      </section>

      {/* Top Properties */}
      <section>
        <TopPropertiesTable />
      </section>
    </div>
  );
}
