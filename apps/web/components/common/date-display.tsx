"use client";

import * as React from "react";
import { useLocaleSettings, formatDateBySettings } from "@/hooks/use-locale-settings";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  date: string;
  format?: "short" | "long" | "withTime";
  showRelative?: boolean;
  className?: string;
}

/**
 * Smart date component that reads tenant locale settings
 * and formats dates in Gregorian or Hijri based on setting.
 * Shows relative time ("2 hours ago") for recent dates when showRelative is true.
 */
export function DateDisplay({
  date,
  format = "short",
  showRelative = false,
  className,
}: DateDisplayProps) {
  const { settings } = useLocaleSettings();

  const formatted = React.useMemo(
    () =>
      formatDateBySettings(date, settings, {
        format,
        showRelative,
      }),
    [date, settings, format, showRelative]
  );

  return (
    <time dateTime={date} className={cn("whitespace-nowrap", className)}>
      {formatted}
    </time>
  );
}
