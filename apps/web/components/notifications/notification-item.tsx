"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { AppNotification, NotificationType } from "@/lib/types";

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bgClass: string }> = {
  info: { icon: Info, color: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-100 dark:bg-blue-950/50" },
  warning: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-100 dark:bg-amber-950/50" },
  success: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-100 dark:bg-emerald-950/50" },
  error: { icon: XCircle, color: "text-red-600 dark:text-red-400", bgClass: "bg-red-100 dark:bg-red-950/50" },
  reminder: { icon: Clock, color: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-100 dark:bg-purple-950/50" },
};

function getTimeAgo(dateStr: string, isAr: boolean): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return isAr ? "الآن" : "Just now";
  if (minutes < 60) return isAr ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
  return isAr ? `منذ ${days} يوم` : `${days}d ago`;
}

interface NotificationItemProps {
  notification: AppNotification;
  onClick?: (notification: AppNotification) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md p-3 transition-colors cursor-pointer hover:bg-muted",
        !notification.read && "bg-muted/50",
        compact && "p-2"
      )}
      onClick={() => onClick?.(notification)}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgClass,
          compact && "h-6 w-6"
        )}
      >
        <Icon className={cn("h-4 w-4", config.color, compact && "h-3 w-3")} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={cn(
            "text-sm leading-tight",
            !notification.read && "font-semibold",
            compact && "text-xs"
          )}
        >
          {isAr ? notification.titleAr : notification.title}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {isAr ? notification.messageAr : notification.message}
          </p>
        )}
      </div>
      <span
        className={cn(
          "text-xs text-muted-foreground whitespace-nowrap shrink-0",
          compact && "text-[10px]"
        )}
      >
        {getTimeAgo(notification.createdAt, isAr)}
      </span>
    </div>
  );
}
