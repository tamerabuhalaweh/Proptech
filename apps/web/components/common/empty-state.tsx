"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Search,
  Inbox,
  BarChart3,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const illustrations: Record<string, LucideIcon> = {
  building: Building2,
  search: Search,
  inbox: Inbox,
  chart: BarChart3,
  users: Users,
};

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: keyof typeof illustrations;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  className?: string;
}

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon || (illustration ? illustrations[illustration] : Building2);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
