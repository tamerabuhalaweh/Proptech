"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { UnitCell } from "./unit-cell";
import { Skeleton } from "@/components/ui/skeleton";
import type { BuildingGrid, UnitStatus } from "@/lib/types";

interface UnitGridProps {
  building: BuildingGrid;
  selectedUnits: string[];
  onUnitClick: (unitId: string) => void;
  onUnitSelect: (unitId: string, multiSelect: boolean) => void;
  filters?: {
    status?: string[];
    type?: string[];
  };
  cellSize?: number;
}

export function UnitGrid({
  building,
  selectedUnits,
  onUnitClick,
  onUnitSelect,
  filters,
  cellSize = 76,
}: UnitGridProps) {
  const t = useTranslations("inventory.grid");

  const isDimmed = (unit: { status: string; type: string }) => {
    if (filters?.status?.length && !filters.status.includes(unit.status)) {
      return true;
    }
    if (filters?.type?.length && !filters.type.includes(unit.type)) {
      return true;
    }
    return false;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="space-y-1">
          {building.floors.map((floor) => (
            <div key={floor.floor} className="flex items-center gap-1">
              {/* Floor label */}
              <div
                className="shrink-0 text-xs font-medium text-muted-foreground text-center"
                style={{ width: 40 }}
              >
                {t("floorLabel", { floor: String(floor.floor) })}
              </div>

              {/* Unit cells */}
              <div className="flex gap-1">
                {floor.units.map((unit, colIdx) => {
                  if (!unit) {
                    return (
                      <div
                        key={`empty-${floor.floor}-${colIdx}`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  }
                  return (
                    <UnitCell
                      key={unit.id}
                      unit={{
                        id: unit.id,
                        number: unit.number,
                        type: unit.type,
                        status: unit.status as UnitStatus,
                        area: unit.area,
                        price: unit.price,
                      }}
                      selected={selectedUnits.includes(unit.id)}
                      dimmed={isDimmed(unit)}
                      size={cellSize}
                      onClick={() => {
                        onUnitClick(unit.id);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onUnitSelect(unit.id, true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UnitGridSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-1">
          <Skeleton className="h-4 w-10 shrink-0" />
          <div className="flex gap-1">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-[76px] w-[76px] rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
