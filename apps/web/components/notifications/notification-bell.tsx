"use client";

import { useLocale } from "next-intl";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { NotificationItem } from "./notification-item";
import { useNotifications, useUnreadNotificationCount, useMarkAllNotificationsAsRead } from "@/hooks/api/use-notifications";
import type { AppNotification } from "@/lib/types";

interface NotificationBellProps {
  onNotificationClick?: (notification: AppNotification) => void;
}

export function NotificationBell({ onNotificationClick }: NotificationBellProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: notificationsData } = useNotifications({ page: 1, perPage: 5 });
  const { data: unreadData } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.count ?? 0;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground"
              aria-label={isAr ? `${unreadCount} إشعارات غير مقروءة` : `${unreadCount} unread notifications`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{isAr ? "الإشعارات" : "Notifications"}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="text-sm font-semibold">
            {isAr ? "الإشعارات" : "Notifications"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0}
          >
            <Check className="h-3 w-3 me-1" />
            {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={onNotificationClick}
                compact
              />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد إشعارات" : "No notifications"}
            </div>
          )}
        </div>
        <div className="border-t p-2">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              {isAr ? "عرض الكل" : "View All"}
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
