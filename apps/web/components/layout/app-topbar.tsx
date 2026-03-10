"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Languages,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CommandSearch } from "@/components/layout/command-search";
import { mockUser, mockNotifications } from "@/lib/mock-data";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
} from "@/hooks/api/use-notifications";

interface AppTopbarProps {
  onMenuToggle: () => void;
  showMenuButton: boolean;
}

function NotificationItem({
  notification,
  locale,
}: {
  notification: (typeof mockNotifications)[0];
  locale: string;
}) {
  const typeColors = {
    lead: "bg-info",
    payment: "bg-success",
    lease: "bg-warning",
    maintenance: "bg-destructive",
  };

  const timeDiff = Date.now() - new Date(notification.timestamp).getTime();
  const minutes = Math.floor(timeDiff / 60000);
  const hours = Math.floor(timeDiff / 3600000);

  let timeAgo: string;
  if (minutes < 1) timeAgo = locale === "ar" ? "الآن" : "Just now";
  else if (minutes < 60) timeAgo = locale === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  else timeAgo = locale === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted cursor-pointer",
        !notification.read && "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "mt-1 h-2 w-2 shrink-0 rounded-full",
          typeColors[notification.type]
        )}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn("text-sm", !notification.read && "font-semibold")}>
          {locale === "ar" ? notification.titleAr : notification.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {locale === "ar"
            ? notification.descriptionAr
            : notification.description}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {timeAgo}
      </span>
    </div>
  );
}

export function AppTopbar({ onMenuToggle, showMenuButton }: AppTopbarProps) {
  const t = useTranslations("topbar");
  const navT = useTranslations("navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Use notification hooks with mock data fallback
  const { data: notificationsData } = useNotifications({ page: 1, perPage: 5 });
  const { data: unreadData } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsAsRead();

  const topbarNotifications = notificationsData?.data || mockNotifications;
  const unreadCount = unreadData?.count ?? mockNotifications.filter((n: { read: boolean }) => !n.read).length;

  const handleLanguageSwitch = () => {
    const newLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      <header
        className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6"
        role="banner"
      >
        {/* Start section */}
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* End section */}
        <div className="flex items-center gap-1">
          {/* Search Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-muted-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>{t("search")}</span>
              <kbd className="ms-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {t("searchShortcut")}
              </kbd>
            </TooltipContent>
          </Tooltip>

          {/* Language Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLanguageSwitch}
                className="text-muted-foreground"
                aria-label={
                  locale === "en"
                    ? "التبديل إلى العربية"
                    : "Switch to English"
                }
              >
                <Languages className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("switchLanguage")}</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-muted-foreground"
                  aria-label={
                    theme === "dark" ? t("lightMode") : t("darkMode")
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("toggleTheme")}</TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground"
                    aria-label={t("notificationsCount", {
                      count: unreadCount.toString(),
                    })}
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
              <TooltipContent>{t("notifications")}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b p-3">
                <h3 className="text-sm font-semibold">{t("notifications")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => markAllRead.mutate()}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-3 w-3" />
                  {locale === "ar" ? "تحديد الكل كمقروء" : "Mark all read"}
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {topbarNotifications.length > 0 ? (
                  topbarNotifications.map((n: typeof mockNotifications[0]) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      locale={locale}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t("noNotifications")}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ms-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(
                      locale === "ar" ? mockUser.nameAr : mockUser.name
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(
                      locale === "ar" ? mockUser.nameAr : mockUser.name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {locale === "ar" ? mockUser.nameAr : mockUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mockUser.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                {navT("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                {navT("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                {navT("switchTenant")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                {navT("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
