"use client";

import { useTranslations, useLocale } from "next-intl";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScoreBadge } from "./score-badge";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { getInitials } from "@/lib/utils";
import type { LeadCardData } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface LeadCardProps {
  lead: LeadCardData;
  variant?: "compact" | "standard";
  onClick?: () => void;
  isDragging?: boolean;
  className?: string;
}

export function LeadCard({
  lead,
  variant = "standard",
  onClick,
  isDragging,
  className,
}: LeadCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";
  const name = isAr ? lead.nameAr : lead.name;
  const location = isAr ? lead.locationAr : lead.location;
  const interest = isAr ? lead.interestAr : lead.interest;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(lead.lastActivityAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  if (variant === "compact") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        className={cn(
          "rounded-lg border bg-card p-3 cursor-pointer transition-shadow hover:shadow-md",
          isDragging && "shadow-xl scale-[1.02] opacity-90",
          className
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate flex-1" dir="auto">
            {name}
          </span>
          <ScoreBadge score={lead.score} scoreLabel={lead.scoreLabel} showValue size="sm" />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {location}
          </span>
          <CurrencyDisplay amount={lead.budgetMin} compact className="text-xs" />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">
                {getInitials(lead.agent.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{isAr ? lead.agent.nameAr : lead.agent.name}</span>
          </div>
          <span>{timeAgo}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "rounded-lg border bg-card p-3 cursor-pointer transition-shadow hover:shadow-md space-y-2",
        isDragging && "shadow-xl scale-[1.02] opacity-90",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold truncate" dir="auto">
          {name}
        </span>
        <ScoreBadge score={lead.score} scoreLabel={lead.scoreLabel} showValue size="sm" />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="truncate">🏢 {interest}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💰</span>
          <CurrencyDisplay amount={lead.budgetMin} compact className="text-xs" />
          <span>-</span>
          <CurrencyDisplay amount={lead.budgetMax} compact className="text-xs" />
        </div>
      </div>

      {lead.nextAction && (
        <div className="flex items-center gap-1 text-xs text-primary">
          <Calendar className="h-3 w-3" />
          <span className="truncate">
            {lead.nextAction.type} •{" "}
            {new Date(lead.nextAction.date).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">
              {getInitials(lead.agent.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{isAr ? lead.agent.nameAr : lead.agent.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {lead.phone && <Phone className="h-3 w-3" />}
          {lead.email && <Mail className="h-3 w-3" />}
          <span className="ms-1">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
