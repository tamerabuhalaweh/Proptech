"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Plus,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const navItems = [
  { labelKey: "dashboard", icon: LayoutDashboard, href: "/" },
  { labelKey: "properties", icon: Building2, href: "/properties" },
  { labelKey: "add", icon: Plus, href: "/properties/new", isAction: true },
  { labelKey: "leads", icon: Users, href: "/leads" },
  {
    labelKey: "settings",
    icon: MoreHorizontal,
    href: "/settings",
  },
];

export function MobileBottomNav() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-background pb-safe md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(`/${locale}${item.href}`);

        if (item.isAction) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-2",
              isActive
                ? "text-accent"
                : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-accent")} />
            <span className="text-[10px] font-medium">
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
