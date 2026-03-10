"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  Users,
  UserCheck,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarCheck,
  Tag,
  MessageSquare,
  Mail,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { mockUser, mockTenants, mockCurrentTenant } from "@/lib/mock-data";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

type NavItem = {
  labelKey: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  children?: NavItem[];
};

const mainNavItems: NavItem[] = [
  {
    labelKey: "dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    labelKey: "properties",
    icon: Building2,
    href: "/properties",
    children: [
      { labelKey: "allProperties", icon: Building2, href: "/properties" },
      { labelKey: "inventoryGrid", icon: Grid3X3, href: "/inventory" },
      { labelKey: "campaigns", icon: Tag, href: "/campaigns" },
      { labelKey: "addProperty", icon: Plus, href: "/properties/new" },
    ],
  },
  {
    labelKey: "bookings",
    icon: CalendarCheck,
    href: "/bookings",
  },
  {
    labelKey: "leads",
    icon: Users,
    href: "/leads",
    badge: 24,
  },
  {
    labelKey: "communications",
    icon: MessageSquare,
    href: "/communications",
    children: [
      { labelKey: "allCommunications", icon: MessageSquare, href: "/communications" },
      { labelKey: "emailTemplates", icon: Mail, href: "/communications/templates" },
    ],
  },
  {
    labelKey: "documents",
    icon: FileText,
    href: "/documents",
  },
  {
    labelKey: "tenants",
    icon: UserCheck,
    href: "/tenants",
  },
  {
    labelKey: "finance",
    icon: Receipt,
    href: "/finance",
    children: [
      { labelKey: "invoices", icon: Receipt, href: "/finance/invoices" },
      { labelKey: "payments", icon: CreditCard, href: "/finance/payments" },
    ],
  },
  {
    labelKey: "reports",
    icon: BarChart3,
    href: "/reports",
  },
];

const secondaryNavItems: NavItem[] = [
  { labelKey: "settings", icon: Settings, href: "/settings" },
  { labelKey: "help", icon: HelpCircle, href: "/help" },
];

function NavLink({
  item,
  collapsed,
  isActive,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  depth?: number;
}) {
  const t = useTranslations("navigation");
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
        isActive &&
          "bg-white/10 text-sidebar-foreground border-s-[3px] border-brand-accent",
        depth > 0 && "ps-10",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-brand-accent")} />
      {!collapsed && (
        <>
          <span className="truncate">{t(item.labelKey)}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="ms-auto h-5 min-w-[20px] rounded-full bg-brand-accent px-1.5 text-[10px] font-semibold text-brand-primary-dark"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {t(item.labelKey)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function NavGroup({
  item,
  collapsed,
  currentPath,
}: {
  item: NavItem;
  collapsed: boolean;
  currentPath: string;
}) {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const isActive =
    currentPath === `/${locale}${item.href}` ||
    currentPath === `/${locale}${item.href}/` ||
    (item.href === "/" && (currentPath === `/${locale}` || currentPath === `/${locale}/`));
  const isChildActive = item.children?.some(
    (child) =>
      currentPath === `/${locale}${child.href}` ||
      currentPath.startsWith(`/${locale}${child.href}/`)
  );
  const [open, setOpen] = React.useState(isChildActive || false);

  if (!item.children) {
    return (
      <NavLink
        item={item}
        collapsed={collapsed}
        isActive={isActive}
      />
    );
  }

  if (collapsed) {
    return (
      <NavLink
        item={item}
        collapsed={collapsed}
        isActive={isActive || !!isChildActive}
      />
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
            (isActive || isChildActive) &&
              "text-sidebar-foreground"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{t(item.labelKey)}</span>
          <ChevronRight
            className={cn(
              "ms-auto h-4 w-4 shrink-0 transition-transform duration-200 rtl:rotate-180",
              open && "rotate-90 rtl:rotate-90"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-0.5">
        {item.children.map((child) => (
          <NavLink
            key={child.href}
            item={child}
            collapsed={false}
            isActive={
              currentPath === `/${locale}${child.href}` ||
              currentPath.startsWith(`/${locale}${child.href}/`)
            }
            depth={1}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-30 flex flex-col border-e bg-sidebar-background text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo + Tenant Switcher */}
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "px-2 justify-center" : "px-4")}>
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent font-bold text-brand-primary-dark text-lg">
            P
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-md p-1.5 text-start hover:bg-white/5 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent font-bold text-brand-primary-dark text-sm">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {locale === "ar"
                      ? mockCurrentTenant.nameAr
                      : mockCurrentTenant.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/50">
                    {mockCurrentTenant.plan}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56"
              sideOffset={8}
            >
              {mockTenants.map((tenant) => (
                <DropdownMenuItem key={tenant.id} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold">
                      {(locale === "ar" ? tenant.nameAr : tenant.name)[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {locale === "ar" ? tenant.nameAr : tenant.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.plan}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>{t("addProperty")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {mainNavItems.map((item) => (
            <NavGroup
              key={item.href}
              item={item}
              collapsed={collapsed}
              currentPath={pathname}
            />
          ))}
        </nav>

        <Separator className="mx-3 my-3 bg-sidebar-border" />

        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={
                pathname === `/${locale}${item.href}` ||
                pathname.startsWith(`/${locale}${item.href}/`)
              }
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "h-8 w-full text-sidebar-foreground/50 hover:bg-white/5 hover:text-sidebar-foreground",
            collapsed && "w-8"
          )}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 rtl:scale-x-[-1]" />
          ) : (
            <PanelLeftClose className="h-4 w-4 rtl:scale-x-[-1]" />
          )}
        </Button>
      </div>

      {/* User Card */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback className="bg-brand-accent text-brand-primary-dark text-xs">
                {getInitials(locale === "ar" ? mockUser.nameAr : mockUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {locale === "ar" ? mockUser.nameAr : mockUser.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {mockUser.role}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sidebar-foreground/50 hover:bg-white/5 hover:text-sidebar-foreground"
                  aria-label={t("logout")}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("logout")}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </aside>
  );
}
