"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KPICard } from "@/components/common/kpi-card";
import { getInitials } from "@/lib/utils";
import { TrendingUp, Users, Target, Clock, Flame, Sun, Snowflake } from "lucide-react";
import type { PipelineSummary } from "@/lib/types";
import { STAGE_COLORS } from "@/lib/mock-leads";

interface LeadAnalyticsProps {
  pipelineData?: PipelineSummary;
  loading?: boolean;
}

// Mock analytics data
const sourceData = [
  { name: "Website", nameAr: "الموقع", value: 45, color: "#3b82f6" },
  { name: "Referral", nameAr: "إحالة", value: 22, color: "#8b5cf6" },
  { name: "Social Media", nameAr: "وسائل التواصل", value: 18, color: "#06b6d4" },
  { name: "Walk-in", nameAr: "زيارة مباشرة", value: 10, color: "#f59e0b" },
  { name: "Phone", nameAr: "هاتف", value: 8, color: "#10b981" },
  { name: "Partner", nameAr: "شريك", value: 5, color: "#ef4444" },
];

const scoreDistribution = [
  { label: "Hot", labelAr: "ساخن", count: 28, color: "#ef4444", icon: Flame },
  { label: "Warm", labelAr: "دافئ", count: 45, color: "#f59e0b", icon: Sun },
  { label: "Cold", labelAr: "بارد", count: 35, color: "#6b7280", icon: Snowflake },
];

const trendData = [
  { date: "Mar 1", leads: 4 },
  { date: "Mar 2", leads: 6 },
  { date: "Mar 3", leads: 3 },
  { date: "Mar 4", leads: 8 },
  { date: "Mar 5", leads: 5 },
  { date: "Mar 6", leads: 7 },
  { date: "Mar 7", leads: 9 },
  { date: "Mar 8", leads: 6 },
  { date: "Mar 9", leads: 11 },
  { date: "Mar 10", leads: 8 },
];

const topBrokers = [
  { name: "Saad Al-Harbi", nameAr: "سعد الحربي", assigned: 42, won: 14, conversionRate: 33, avgResponseTime: "2h" },
  { name: "Huda Al-Rashid", nameAr: "هدى الراشد", assigned: 35, won: 10, conversionRate: 29, avgResponseTime: "3h" },
  { name: "Omar Al-Faraj", nameAr: "عمر الفرج", assigned: 28, won: 7, conversionRate: 25, avgResponseTime: "4h" },
  { name: "Noura Al-Saud", nameAr: "نورة السعود", assigned: 20, won: 4, conversionRate: 20, avgResponseTime: "5h" },
];

export function LeadAnalytics({ pipelineData, loading }: LeadAnalyticsProps) {
  const t = useTranslations("leads");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // Pipeline funnel data
  const funnelData = pipelineData?.stages.map((s) => ({
    stage: t(`stages.${s.stage}`),
    count: s.count,
    color: STAGE_COLORS[s.stage].replace("bg-", ""),
  })) || [];

  const stageColors = [
    "#64748b", // new - slate
    "#3b82f6", // contacted - blue
    "#8b5cf6", // qualified - purple
    "#06b6d4", // viewing - cyan
    "#f59e0b", // negotiation - amber
    "#22c55e", // won - green
    "#ef4444", // lost - red
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="leads.analytics.totalLeads"
          value={pipelineData?.totalLeads || 0}
          icon={Users}
          iconColor="text-blue-600"
          trend={{ value: 12, direction: "up", label: "dashboard.kpi.vsLastMonth" }}
          loading={loading}
        />
        <KPICard
          label="leads.analytics.conversionRate"
          value={`${pipelineData?.conversionRate || 0}%`}
          icon={Target}
          iconColor="text-green-600"
          trend={{ value: 3.5, direction: "up", label: "dashboard.kpi.vsLastMonth" }}
          loading={loading}
        />
        <KPICard
          label="leads.analytics.avgCloseTime"
          value={`${pipelineData?.avgDaysToClose || 0} ${t("days")}`}
          icon={Clock}
          iconColor="text-amber-600"
          trend={{ value: 2, direction: "down", label: "dashboard.kpi.vsLastMonth" }}
          loading={loading}
        />
        <KPICard
          label="leads.analytics.hotLeads"
          value={scoreDistribution[0].count}
          icon={Flame}
          iconColor="text-red-600"
          trend={{ value: 8, direction: "up", label: "dashboard.kpi.vsLastMonth" }}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("analytics.pipelineFunnel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={stageColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("analytics.bySource")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {sourceData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span>{isAr ? s.nameAr : s.name}</span>
                    </div>
                    <span className="font-medium">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("analytics.scoreDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreDistribution.map((s) => {
                const Icon = s.icon;
                const total = scoreDistribution.reduce((sum, d) => sum + d.count, 0);
                const pct = Math.round((s.count / total) * 100);
                return (
                  <div key={s.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: s.color }} />
                        <span>{isAr ? s.labelAr : s.label}</span>
                      </div>
                      <span className="font-medium">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* New Leads Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("analytics.newLeadsTrend")}</CardTitle>
              <div className="flex items-center gap-1">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={trendPeriod === p ? "default" : "ghost"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setTrendPeriod(p)}
                  >
                    {t(`analytics.${p}`)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Brokers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.topBrokers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("analytics.broker")}</TableHead>
                <TableHead className="text-center">{t("analytics.leadsAssigned")}</TableHead>
                <TableHead className="text-center">{t("analytics.leadsWon")}</TableHead>
                <TableHead className="text-center">{t("analytics.convRate")}</TableHead>
                <TableHead className="text-center">{t("analytics.avgResponse")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBrokers.map((broker) => (
                <TableRow key={broker.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(broker.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {isAr ? broker.nameAr : broker.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{broker.assigned}</TableCell>
                  <TableCell className="text-center">{broker.won}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={broker.conversionRate >= 30 ? "default" : "secondary"} className="text-xs">
                      {broker.conversionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{broker.avgResponseTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
