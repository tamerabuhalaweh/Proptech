"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Tag,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CampaignDetailSheet } from "@/components/campaigns/campaign-detail-sheet";
import { CreateCampaignSheet } from "@/components/campaigns/create-campaign-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaigns, useCreateCampaign } from "@/hooks/api/use-campaigns";
import type { Campaign, CampaignStatus } from "@/lib/types";
import { toast } from "sonner";

const statusOptions: CampaignStatus[] = ["draft", "active", "ended", "paused"];

export default function CampaignsPage() {
  const t = useTranslations("campaigns");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const createCampaign = useCreateCampaign();

  const { data, isLoading } = useCampaigns({
    search: search || undefined,
    status: statusFilter !== "all" ? [statusFilter] : undefined,
  });

  const campaigns = (data?.data || []) as Campaign[];

  const openDetail = (id: string) => {
    setSelectedCampaignId(id);
    setDetailOpen(true);
  };

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createCampaign.mutateAsync(formData);
      toast.success(t("createSuccess"));
    } catch {
      toast.error(t("createError"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { count: campaigns.length })}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("createCampaign")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon("all")}</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <CampaignsGridSkeleton />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t("empty.title")}
          description={t("empty.description")}
          action={{
            label: t("createCampaign"),
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openDetail(campaign.id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {isAr ? campaign.nameAr : campaign.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {isAr ? campaign.descriptionAr : campaign.description}
                    </p>
                  </div>
                  <CampaignStatusBadge status={campaign.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <DateDisplay date={campaign.startDate} format="short" />
                  <span>→</span>
                  <DateDisplay date={campaign.endDate} format="short" />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 me-1" />
                    {campaign.discountType === "percentage"
                      ? `${campaign.discountValue}%`
                      : <CurrencyDisplay amount={campaign.discountValue} compact />}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {campaign.stats.unitsAffected} {t("units")}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t">
                  <span className="text-muted-foreground">
                    {t("stats.unitsSold")}: {campaign.stats.unitsSold}
                  </span>
                  <CurrencyDisplay
                    amount={campaign.stats.revenueImpact}
                    compact
                    showChange
                    className="font-medium"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CampaignDetailSheet
        campaignId={selectedCampaignId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <CreateCampaignSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function CampaignsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}
