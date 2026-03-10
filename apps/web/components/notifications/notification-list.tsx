"use client";

import { useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "./notification-item";
import type { AppNotification } from "@/lib/types";

interface NotificationListProps {
  notifications: AppNotification[];
  loading?: boolean;
  onNotificationClick?: (notification: AppNotification) => void;
}

export function NotificationList({
  notifications,
  loading,
  onNotificationClick,
}: NotificationListProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد إشعارات" : "No notifications"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
