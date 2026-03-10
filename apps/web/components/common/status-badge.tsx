"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const unitStatusConfig: Record<
  string,
  { color: string; bgLight: string; bgDark: string }
> = {
  available: {
    color: "text-emerald-700 dark:text-emerald-400",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-950/30",
  },
  reserved: {
    color: "text-amber-700 dark:text-amber-400",
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/30",
  },
  sold: {
    color: "text-blue-700 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
  },
  occupied: {
    color: "text-blue-700 dark:text-blue-400",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-950/30",
  },
  blocked: {
    color: "text-red-700 dark:text-red-400",
    bgLight: "bg-red-50",
    bgDark: "dark:bg-red-950/30",
  },
  maintenance: {
    color: "text-gray-600 dark:text-gray-400",
    bgLight: "bg-gray-50",
    bgDark: "dark:bg-gray-900/30",
  },
};

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "dot" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function StatusBadge({
  status,
  variant = "default",
  size = "default",
  className,
}: StatusBadgeProps) {
  const t = useTranslations("unitStatus");
  const config = unitStatusConfig[status] || unitStatusConfig.maintenance;

  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          config.color,
          className
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            config.bgLight.replace("bg-", "bg-").replace("-50", "-500")
          )}
          style={{
            backgroundColor:
              status === "available"
                ? "#16A34A"
                : status === "reserved"
                  ? "#D97706"
                  : status === "sold" || status === "occupied"
                    ? "#2563EB"
                    : status === "blocked"
                      ? "#DC2626"
                      : "#6B7280",
          }}
        />
        {t(status)}
      </span>
    );
  }

  return (
    <Badge
      className={cn(
        "border-transparent font-medium",
        config.bgLight,
        config.bgDark,
        config.color,
        size === "sm" && "text-[10px] px-1.5 py-0",
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
    >
      {t(status)}
    </Badge>
  );
}
