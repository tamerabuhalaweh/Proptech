"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_CONFIG } from "@/lib/mock-bookings";
import type { BookingStatus } from "@/lib/types";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const t = useTranslations("bookings.status");
  const config = BOOKING_STATUS_CONFIG[status];

  return (
    <Badge
      className={cn(
        "border-transparent font-medium",
        config.bgClass,
        config.color,
        className
      )}
    >
      <span className="me-1">{config.emoji}</span>
      {t(status)}
    </Badge>
  );
}
