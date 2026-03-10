"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  Users,
  UserCheck,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const t = useTranslations("topbar");
  const navT = useTranslations("navigation");
  const locale = useLocale();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (_value: string) => {
    onOpenChange(false);
    // In production, navigate to the selected result
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t("search")}>
      <CommandInput placeholder={t("search")} dir="auto" />
      <CommandList>
        <CommandEmpty>
          {locale === "ar" ? "لا توجد نتائج" : "No results found."}
        </CommandEmpty>

        <CommandGroup heading={locale === "ar" ? "صفحات" : "Pages"}>
          <CommandItem onSelect={() => handleSelect("dashboard")}>
            <BarChart3 className="h-4 w-4" />
            <span>{navT("dashboard")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("properties")}>
            <Building2 className="h-4 w-4" />
            <span>{navT("properties")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("leads")}>
            <Users className="h-4 w-4" />
            <span>{navT("leads")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("tenants")}>
            <UserCheck className="h-4 w-4" />
            <span>{navT("tenants")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={locale === "ar" ? "عقارات" : "Properties"}>
          <CommandItem onSelect={() => handleSelect("alnoor")}>
            <Building2 className="h-4 w-4" />
            <div>
              <span className="block">
                {locale === "ar" ? "سكن النور" : "Al Noor Residence"}
              </span>
              <span className="text-xs text-muted-foreground">
                {locale === "ar" ? "١٢٠ وحدة" : "120 units"}
              </span>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("riyadh")}>
            <Building2 className="h-4 w-4" />
            <div>
              <span className="block">
                {locale === "ar" ? "برج الرياض" : "Riyadh Tower"}
              </span>
              <span className="text-xs text-muted-foreground">
                {locale === "ar" ? "٨٥ وحدة" : "85 units"}
              </span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={locale === "ar" ? "إجراءات" : "Actions"}>
          <CommandItem onSelect={() => handleSelect("add-property")}>
            <Building2 className="h-4 w-4" />
            <span>{navT("addProperty")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("settings")}>
            <Settings className="h-4 w-4" />
            <span>{navT("settings")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
