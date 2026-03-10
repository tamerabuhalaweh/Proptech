"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotifications } from "@/hooks/api/use-notifications";
import { mockAppNotifications } from "@/lib/mock-notifications";
import type { AppNotification } from "@/lib/types";

export default function NotificationsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();

  const { data, isLoading } = useNotifications();
  const notifications = (data?.data || mockAppNotifications) as AppNotification[];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = useCallback(
    (notification: AppNotification) => {
      // Mark as read (would call API in real app)
      console.log("Mark as read:", notification.id);
      if (notification.link) {
        router.push(notification.link);
      }
    },
    [router]
  );

  const handleMarkAllAsRead = useCallback(() => {
    console.log("Mark all as read");
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? "الإشعارات" : "Notifications"}
        subtitle={
          isAr
            ? `${unreadCount} إشعار غير مقروء`
            : `${unreadCount} unread notifications`
        }
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 me-1" />
              {isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
            </Button>
          ) : undefined
        }
      />

      <div className="max-w-3xl">
        <NotificationList
          notifications={notifications}
          loading={isLoading}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
}
