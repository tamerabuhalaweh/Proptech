"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UnitStatus } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  studio: "STD",
  "1br": "1BR",
  "2br": "2BR",
  "3br": "3BR",
  "4br": "4BR",
  penthouse: "PH",
  commercial: "COM",
  retail: "RTL",
};

const STATUS_STYLES: Record<
  UnitStatus,
  { bg: string; border: string; text: string }
> = {
  available: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  reserved: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
  },
  occupied: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
  },
  blocked: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
  },
  maintenance: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-600 dark:text-gray-400",
  },
};

interface UnitCellProps {
  unit: {
    id: string;
    number: string;
    type: string;
    status: UnitStatus;
    area: number;
    price: number;
  };
  selected: boolean;
  dimmed: boolean;
  size?: number;
  campaignActive?: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function UnitCell({
  unit,
  selected,
  dimmed,
  size = 76,
  campaignActive = false,
  onClick,
  onContextMenu,
}: UnitCellProps) {
  const styles = STATUS_STYLES[unit.status] || STATUS_STYLES.maintenance;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          onContextMenu={onContextMenu}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-md border transition-all",
            styles.bg,
            styles.border,
            styles.text,
            selected && "ring-2 ring-primary ring-offset-1",
            dimmed && "opacity-20",
            !dimmed && "hover:shadow-sm hover:scale-[1.02]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          style={{ width: size, height: size }}
          aria-label={`Unit ${unit.number}, ${unit.type}, ${unit.status}`}
        >
          {campaignActive && (
            <span className="absolute -top-1 -end-1 h-3 w-3 rounded-full bg-orange-500 ring-1 ring-background" title="Campaign active" />
          )}
          <span className="text-[10px] font-bold leading-none">
            {unit.number}
          </span>
          <span className="text-[9px] mt-1 leading-none opacity-75 uppercase">
            {TYPE_LABELS[unit.type] || unit.type}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold">Unit {unit.number}</p>
          <p>Type: {unit.type}</p>
          <p>Area: {unit.area} m²</p>
          <p>Price: SAR {unit.price.toLocaleString()}/yr</p>
          <p className="capitalize">Status: {unit.status}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
