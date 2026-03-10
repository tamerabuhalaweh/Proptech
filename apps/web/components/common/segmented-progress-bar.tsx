"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface SegmentedProgressBarProps {
  segments: Segment[];
  total?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  onSegmentClick?: (label: string) => void;
  activeSegment?: string;
  height?: "sm" | "default" | "lg";
}

export function SegmentedProgressBar({
  segments,
  total,
  showLegend = false,
  showPercentage = false,
  onSegmentClick,
  activeSegment,
  height = "default",
}: SegmentedProgressBarProps) {
  const computedTotal = total || segments.reduce((sum, s) => sum + s.value, 0);
  const heightClass =
    height === "sm" ? "h-2" : height === "lg" ? "h-4" : "h-3";

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className={cn("flex w-full overflow-hidden rounded-full", heightClass)}>
        {segments.map((segment) => {
          const pct = computedTotal > 0 ? (segment.value / computedTotal) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={segment.label}
              className={cn(
                "transition-all duration-300",
                segment.color,
                onSegmentClick && "cursor-pointer hover:opacity-80",
                activeSegment && activeSegment !== segment.label && "opacity-30"
              )}
              style={{ width: `${pct}%` }}
              onClick={() => onSegmentClick?.(segment.label)}
              role="progressbar"
              aria-valuenow={segment.value}
              aria-valuemax={computedTotal}
              aria-label={`${segment.label}: ${segment.value}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {segments.map((segment) => {
            const pct =
              computedTotal > 0
                ? ((segment.value / computedTotal) * 100).toFixed(1)
                : "0";
            return (
              <div
                key={segment.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  onSegmentClick && "cursor-pointer",
                  activeSegment &&
                    activeSegment !== segment.label &&
                    "opacity-40"
                )}
                onClick={() => onSegmentClick?.(segment.label)}
              >
                <div
                  className={cn("h-2.5 w-2.5 rounded-full", segment.color)}
                />
                <span className="text-muted-foreground">{segment.label}</span>
                <span className="font-medium">{segment.value}</span>
                {showPercentage && (
                  <span className="text-muted-foreground">({pct}%)</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
