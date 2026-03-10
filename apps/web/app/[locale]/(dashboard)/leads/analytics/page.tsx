"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header";
import { LeadAnalytics } from "@/components/leads/lead-analytics";
import { usePipelineStats } from "@/hooks/api/use-leads";
import { mockPipelineSummary } from "@/lib/mock-leads";

export default function LeadAnalyticsPage() {
  const t = useTranslations("leads");
  const { data: pipelineStats, isLoading } = usePipelineStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("analytics.totalLeads")}
        subtitle={t("analyticsView")}
      />
      <LeadAnalytics
        pipelineData={pipelineStats || mockPipelineSummary}
        loading={isLoading}
      />
    </div>
  );
}
