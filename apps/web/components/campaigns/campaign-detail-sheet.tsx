"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  BarChart3,
  Calendar,
  Tag,
  Building2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import { StatusBadge } from "@/components/common/status-badge";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { useCampaign, useCampaignUnits } from "@/hooks/api/use-campaigns";
import type { Campaign } from "@/lib/types";

interface CampaignDetailSheetProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailSheet({
  campaignId,
  open,
  onOpenChange,
}: CampaignDetailSheetProps) {
  const t = useTranslations("campaigns");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: campaign, isLoading } = useCampaign(campaignId || "");
  const { data: units } = useCampaignUnits(campaignId || "");

  if (!campaignId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {isLoading || !campaign ? (
              <CampaignDetailSkeleton />
            ) : (
              <>
                <SheetHeader className="mb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle>{isAr ? campaign.nameAr : campaign.name}</SheetTitle>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">
                      {isAr ? campaign.descriptionAr : campaign.description}
                    </p>
                  )}
                </SheetHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold">{campaign.stats.unitsAffected}</p>
                      <p className="text-xs text-muted-foreground">{t("stats.unitsAffected")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold">{campaign.stats.unitsSold}</p>
                      <p className="text-xs text-muted-foreground">{t("stats.unitsSold")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <CurrencyDisplay
                        amount={campaign.stats.revenueImpact}
                        compact
                        className="text-lg font-bold"
                        showChange
                      />
                      <p className="text-xs text-muted-foreground">{t("stats.revenueImpact")}</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Campaign Period */}
                <div className="my-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("detail.period")}
                  </h4>
                  <div className="flex items-center gap-2 text-sm">
                    <DateDisplay date={campaign.startDate} />
                    <span className="text-muted-foreground">→</span>
                    <DateDisplay date={campaign.endDate} />
                  </div>

                  {/* Timeline bar */}
                  <div className="mt-2 relative h-2 rounded-full bg-muted overflow-hidden">
                    {(() => {
                      const start = new Date(campaign.startDate).getTime();
                      const end = new Date(campaign.endDate).getTime();
                      const now = Date.now();
                      const total = end - start;
                      const elapsed = Math.max(0, Math.min(now - start, total));
                      const pct = total > 0 ? (elapsed / total) * 100 : 0;
                      return (
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Discount Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t("detail.discount")}
                  </h4>
                  <Badge variant="secondary" className="text-sm">
                    {campaign.discountType === "percentage"
                      ? `${campaign.discountValue}% ${t("form.percentage")}`
                      : <><CurrencyDisplay amount={campaign.discountValue} /> {t("form.fixedAmount")}</>}
                  </Badge>
                </div>

                <Separator />

                {/* Affected Units */}
                {units && units.length > 0 && (
                  <div className="my-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t("detail.affectedUnits")}
                    </h4>
                    <div className="space-y-2">
                      {units.map((unit) => (
                        <div
                          key={unit.unitId}
                          className="flex items-center justify-between p-2 rounded-md border text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{unit.unitNumber}</span>
                            <StatusBadge status={unit.status} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="line-through text-muted-foreground">
                              <CurrencyDisplay amount={unit.originalPrice} compact />
                            </span>
                            <TrendingDown className="h-3 w-3 text-emerald-600" />
                            <CurrencyDisplay
                              amount={unit.discountedPrice}
                              compact
                              className="font-semibold text-emerald-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function CampaignDetailSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-60" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
