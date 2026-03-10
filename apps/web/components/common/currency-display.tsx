"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { cn, formatCurrency } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  compact?: boolean;
  showChange?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  currency = "SAR",
  compact = false,
  showChange = false,
  className,
}: CurrencyDisplayProps) {
  const locale = useLocale();

  const formatted = formatCurrency(
    Math.abs(amount),
    locale === "ar" ? "ar-SA" : "en-SA",
    compact
  );

  const prefix = showChange ? (amount >= 0 ? "+" : "-") : "";

  return (
    <span
      className={cn(
        showChange && amount >= 0 && "text-success",
        showChange && amount < 0 && "text-destructive",
        className
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}
