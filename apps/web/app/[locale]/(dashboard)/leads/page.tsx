"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, Upload, LayoutGrid, Table2, BarChart3, Search } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PipelineSummary } from "@/components/leads/pipeline-summary";
import { PipelineBoard } from "@/components/leads/pipeline-board";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { CreateLeadSheet } from "@/components/leads/create-lead-sheet";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadAnalytics } from "@/components/leads/lead-analytics";
import {
  useLeads,
  useLeadsByStage,
  usePipelineStats,
} from "@/hooks/api/use-leads";
import { mockLeads, mockPipelineSummary } from "@/lib/mock-leads";
import type { LeadStage } from "@/lib/types";

type ViewMode = "kanban" | "table" | "analytics";

export default function LeadsPage() {
  const t = useTranslations("leads");
  const tCommon = useTranslations("common");

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<LeadStage | null>(null);
  const [search, setSearch] = useState("");

  // Data hooks
  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    stage: stageFilter ? [stageFilter] : undefined,
    search: search || undefined,
  });
  const { data: stageData, isLoading: stageLoading } = useLeadsByStage();
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();

  const leads = leadsData?.data || mockLeads;

  const handleCardClick = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
    setDetailOpen(true);
  }, []);

  const handleMoveCard = useCallback(
    (leadId: string, fromStage: string, toStage: string) => {
      // Optimistic update would be here
      console.log(`Move lead ${leadId} from ${fromStage} to ${toStage}`);
    },
    []
  );

  const handleCreateLead = useCallback((data: Record<string, unknown>) => {
    console.log("Create lead:", data);
  }, []);

  const handleStageFilterClick = useCallback((stage: LeadStage | null) => {
    setStageFilter((prev) => (prev === stage ? null : stage));
  }, []);

  // Compute stage values from pipeline stats
  const stageValues: Record<string, number> = {};
  if (pipelineStats) {
    for (const s of pipelineStats.stages) {
      stageValues[s.stage] = s.totalValue;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { count: String(pipelineStats?.activeLeads || leads.length) })}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 me-1" />
              {tCommon("import")}
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 me-1" />
              {t("addLead")}
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="ps-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ms-auto">
          <Select>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder={t("score")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">{t("score.hot")}</SelectItem>
              <SelectItem value="warm">{t("score.warm")}</SelectItem>
              <SelectItem value="cold">{t("score.cold")}</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="h-9 w-[130px] text-xs">
              <SelectValue placeholder={t("source")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">{t("sources.website")}</SelectItem>
              <SelectItem value="referral">{t("sources.referral")}</SelectItem>
              <SelectItem value="walk_in">{t("sources.walk_in")}</SelectItem>
              <SelectItem value="social_media">{t("sources.social_media")}</SelectItem>
              <SelectItem value="phone">{t("sources.phone")}</SelectItem>
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="border rounded-lg"
          >
            <ToggleGroupItem value="kanban" aria-label={t("kanbanView")} className="h-9 px-2.5">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label={t("tableView")} className="h-9 px-2.5">
              <Table2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="analytics" aria-label={t("analyticsView")} className="h-9 px-2.5">
              <BarChart3 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Pipeline Summary (visible in kanban/table) */}
      {viewMode !== "analytics" && (
        <PipelineSummary
          data={pipelineStats || mockPipelineSummary}
          loading={pipelineLoading}
          onStageClick={handleStageFilterClick}
          activeStage={stageFilter}
        />
      )}

      {/* View Content */}
      {viewMode === "kanban" && (
        <PipelineBoard
          stages={stageData || {
            new: [],
            contacted: [],
            qualified: [],
            viewing: [],
            negotiation: [],
            won: [],
            lost: [],
          }}
          stageValues={stageValues}
          onMoveCard={handleMoveCard}
          onCardClick={handleCardClick}
          loading={stageLoading}
        />
      )}

      {viewMode === "table" && (
        <LeadsTable
          leads={leads}
          loading={leadsLoading}
          onRowClick={handleCardClick}
          onStageFilter={(stage) => setStageFilter(stage)}
          activeStageFilter={stageFilter}
        />
      )}

      {viewMode === "analytics" && (
        <LeadAnalytics
          pipelineData={pipelineStats || mockPipelineSummary}
          loading={pipelineLoading}
        />
      )}

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Create Lead Sheet */}
      <CreateLeadSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}
