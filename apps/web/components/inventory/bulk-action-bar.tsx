"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { X, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UnitStatus } from "@/lib/types";

const STATUSES: { value: UnitStatus; color: string }[] = [
  { value: "available", color: "bg-emerald-500" },
  { value: "reserved", color: "bg-amber-500" },
  { value: "occupied", color: "bg-blue-500" },
  { value: "blocked", color: "bg-red-500" },
  { value: "maintenance", color: "bg-gray-500" },
];

interface BulkActionBarProps {
  selectedCount: number;
  onChangeStatus: (status: UnitStatus) => void;
  onExport: () => void;
  onClearSelection: () => void;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onChangeStatus,
  onExport,
  onClearSelection,
  className,
}: BulkActionBarProps) {
  const t = useTranslations("inventory.bulk");
  const statusT = useTranslations("unitStatus");

  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 start-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-lg",
        "animate-in slide-in-from-bottom-4 fade-in duration-200",
        className
      )}
    >
      {/* Selected count */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClearSelection}
          className="rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium whitespace-nowrap">
          {t("selectedCount", { count: String(selectedCount) })}
        </span>
      </div>

      {/* Change Status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 me-1" />
            {t("changeStatus")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {STATUSES.map(({ value, color }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onChangeStatus(value)}
            >
              <div className={cn("h-3 w-3 rounded-full me-2", color)} />
              {statusT(value)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export */}
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 me-1" />
        {t("exportSelected")}
      </Button>
    </div>
  );
}
