"use client";

import { useLocale } from "next-intl";

export function useDirection() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return {
    dir: isRTL ? ("rtl" as const) : ("ltr" as const),
    isRTL,
    startSide: isRTL ? ("right" as const) : ("left" as const),
    endSide: isRTL ? ("left" as const) : ("right" as const),
  };
}
