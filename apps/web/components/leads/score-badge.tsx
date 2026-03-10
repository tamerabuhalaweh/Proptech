"use client";

import { useTranslations } from "next-intl";
import { Flame, Sun, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadScoreLabel } from "@/lib/types";

const scoreConfig: Record<
  LeadScoreLabel,
  { icon: typeof Flame; bg: string; text: string; label: string }
> = {
  hot: {
    icon: Flame,
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    label: "leads.score.hot",
  },
  warm: {
    icon: Sun,
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    label: "leads.score.warm",
  },
  cold: {
    icon: Snowflake,
    bg: "bg-gray-100 dark:bg-gray-800/40",
    text: "text-gray-600 dark:text-gray-400",
    label: "leads.score.cold",
  },
};

interface ScoreBadgeProps {
  score: number;
  scoreLabel: LeadScoreLabel;
  showLabel?: boolean;
  showValue?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function ScoreBadge({
  score,
  scoreLabel,
  showLabel = true,
  showValue = false,
  size = "default",
  className,
}: ScoreBadgeProps) {
  const t = useTranslations();
  const config = scoreConfig[scoreLabel];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.bg,
        config.text,
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "default" && "px-2 py-0.5 text-xs",
        size === "lg" && "px-3 py-1 text-sm",
        className
      )}
      aria-label={`Lead score: ${score} out of 100, ${scoreLabel}`}
    >
      <Icon
        className={cn(
          size === "sm" && "h-2.5 w-2.5",
          size === "default" && "h-3 w-3",
          size === "lg" && "h-4 w-4"
        )}
      />
      {showLabel && <span>{t(config.label)}</span>}
      {showValue && <span>{score}</span>}
    </span>
  );
}
