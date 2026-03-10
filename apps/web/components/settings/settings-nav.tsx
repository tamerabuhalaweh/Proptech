"use client";

import { useTranslations } from "next-intl";
import {
  Building2,
  Users,
  CreditCard,
  Globe,
  Shield,
  ChevronRight,
  Bell,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const settingsGroups = [
  {
    key: "general",
    icon: Building2,
    items: [{ key: "general", label: "settings.nav.general" }],
  },
  {
    key: "team",
    icon: Users,
    items: [
      { key: "users", label: "settings.nav.users" },
      { key: "roles", label: "settings.nav.roles" },
    ],
  },
  {
    key: "billing",
    icon: CreditCard,
    items: [{ key: "subscription", label: "settings.nav.subscription" }],
  },
  {
    key: "platform",
    icon: Globe,
    items: [
      { key: "localization", label: "settings.nav.localization" },
      { key: "notifications", label: "settings.nav.notifications" },
    ],
  },
  {
    key: "security",
    icon: Shield,
    items: [{ key: "security", label: "settings.nav.security" }],
  },
];

interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

export function SettingsNav({ activeSection, onSectionChange, className }: SettingsNavProps) {
  const t = useTranslations();

  return (
    <nav aria-label="Settings navigation" className={cn("space-y-1", className)}>
      {settingsGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.key}>
            {group.items.map((item) => (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted/80",
                  activeSection === item.key
                    ? "bg-muted font-medium border-s-2 border-primary text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <GroupIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-start">{t(item.label)}</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </button>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
