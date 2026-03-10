"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/mock-campaigns";
import type { CampaignStatus } from "@/lib/types";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  const t = useTranslations("campaigns.status");
  const config = CAMPAIGN_STATUS_CONFIG[status];

  return (
    <Badge
      className={cn(
        "border-transparent font-medium",
        config.bgClass,
        config.color,
        className
      )}
    >
      {t(status)}
    </Badge>
  );
}
