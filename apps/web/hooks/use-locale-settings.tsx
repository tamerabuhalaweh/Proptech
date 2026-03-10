"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localeApi } from "@/lib/api";
import type { LocaleSettings } from "@/lib/types";

const defaultLocaleSettings: LocaleSettings = {
  defaultLocale: "ar",
  dateFormat: "both",
  primaryCalendar: "hijri",
  timeFormat: "12h",
  numberFormat: "western",
  currencyPosition: "after",
  currency: "SAR",
  firstDayOfWeek: "sunday",
  timezone: "Asia/Riyadh",
};

const LocaleSettingsContext = React.createContext<{
  settings: LocaleSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<LocaleSettings>) => void;
}>({
  settings: defaultLocaleSettings,
  isLoading: false,
  updateSettings: () => {},
});

export function LocaleSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["locale-settings"],
    queryFn: async () => {
      try {
        return await localeApi.getSettings();
      } catch {
        return defaultLocaleSettings;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<LocaleSettings>) =>
      localeApi.updateSettings(payload as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locale-settings"] });
    },
  });

  const value = React.useMemo(
    () => ({
      settings: (settings as LocaleSettings) || defaultLocaleSettings,
      isLoading,
      updateSettings: (s: Partial<LocaleSettings>) => updateMutation.mutate(s),
    }),
    [settings, isLoading, updateMutation]
  );

  return (
    <LocaleSettingsContext.Provider value={value}>
      {children}
    </LocaleSettingsContext.Provider>
  );
}

export function useLocaleSettings() {
  return React.useContext(LocaleSettingsContext);
}

/**
 * Format a date string according to tenant locale settings.
 */
export function formatDateBySettings(
  dateStr: string,
  settings: LocaleSettings,
  options?: {
    format?: "short" | "long" | "withTime";
    showRelative?: boolean;
  }
): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Show relative time for recent dates
  if (options?.showRelative && diffHours < 24 && diffHours >= 0) {
    if (diffHours < 1) {
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return settings.defaultLocale === "ar" ? "الآن" : "Just now";
      return settings.defaultLocale === "ar"
        ? `منذ ${mins} دقيقة`
        : `${mins}m ago`;
    }
    const hrs = Math.floor(diffHours);
    return settings.defaultLocale === "ar"
      ? `منذ ${hrs} ساعة`
      : `${hrs}h ago`;
  }

  const locale = settings.defaultLocale === "ar" ? "ar-SA" : "en-SA";

  if (settings.primaryCalendar === "hijri") {
    try {
      const hijriFormatter = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
        year: "numeric",
        month: options?.format === "long" ? "long" : "numeric",
        day: "numeric",
        ...(options?.format === "withTime"
          ? {
              hour: "numeric",
              minute: "numeric",
              hour12: settings.timeFormat === "12h",
            }
          : {}),
      });
      const hijriStr = hijriFormatter.format(date);

      if (settings.dateFormat === "both") {
        const gregFormatter = new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: options?.format === "long" ? "long" : "numeric",
          day: "numeric",
        });
        return `${hijriStr} (${gregFormatter.format(date)})`;
      }

      return hijriStr;
    } catch {
      // Fall through to Gregorian
    }
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: options?.format === "long" ? "long" : "numeric",
    day: "numeric",
    ...(options?.format === "withTime"
      ? {
          hour: "numeric",
          minute: "numeric",
          hour12: settings.timeFormat === "12h",
        }
      : {}),
  });

  return formatter.format(date);
}
