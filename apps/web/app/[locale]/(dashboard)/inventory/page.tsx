"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  LayoutGrid,
  TableIcon,
  X,
  Plus,
  Upload,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { SegmentedProgressBar } from "@/components/common/segmented-progress-bar";
import { UnitGrid, UnitGridSkeleton } from "@/components/inventory/unit-grid";
import { UnitDetailSheet } from "@/components/inventory/unit-detail-sheet";
import { BulkActionBar } from "@/components/inventory/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useInventoryGrid,
  useInventorySummary,
  useInventoryUnits,
} from "@/hooks/api/use-inventory";
import { useUnitSelection } from "@/hooks/use-unit-selection";
import { useDebounce } from "@/hooks/use-debounce";
import { mockBuildings } from "@/lib/mock-properties";
import type { Unit, UnitStatus } from "@/lib/types";

type ViewMode = "grid" | "table";

const STATUS_SEGMENTS = [
  { key: "available" as const, color: "bg-emerald-500" },
  { key: "reserved" as const, color: "bg-amber-500" },
  { key: "occupied" as const, color: "bg-blue-500" },
  { key: "blocked" as const, color: "bg-red-500" },
  { key: "maintenance" as const, color: "bg-gray-500" },
];

const UNIT_TYPES = ["studio", "1br", "2br", "3br", "4br", "penthouse"] as const;

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const statusT = useTranslations("unitStatus");
  const typeT = useTranslations("unitType");
  const commonT = useTranslations("common");
  const locale = useLocale();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<string>("");
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [selectedUnitId, setSelectedUnitId] = React.useState<string>("");
  const [detailOpen, setDetailOpen] = React.useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const {
    selectedIds,
    isSelected,
    toggleSelect,
    clearSelection,
    selectedCount,
  } = useUnitSelection();

  // Data
  const { data: grids, isLoading: gridsLoading } = useInventoryGrid(
    selectedBuildingId || undefined
  );
  const { data: summary, isLoading: summaryLoading } = useInventorySummary(
    selectedBuildingId || undefined
  );
  const { data: unitsData } = useInventoryUnits({
    buildingId: selectedBuildingId || undefined,
    status: statusFilter.length ? statusFilter : undefined,
    type: typeFilter.length ? typeFilter : undefined,
    search: debouncedSearch || undefined,
    perPage: 100,
  });

  const buildings = mockBuildings;
  const totalUnits = summary?.total || 0;
  const units: Unit[] = unitsData?.data || [];

  const handleUnitClick = (unitId: string) => {
    setSelectedUnitId(unitId);
    setDetailOpen(true);
  };

  const handleChangeStatus = (status: UnitStatus) => {
    // In a real app, this would call the API
    console.log("Change status for", selectedIds, "to", status);
    clearSelection();
  };

  const handleExport = () => {
    console.log("Export units:", selectedIds);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Summary progress segments
  const summarySegments = summary
    ? STATUS_SEGMENTS.filter((s) => (summary as Record<string, number>)[s.key] > 0).map((s) => ({
        label: statusT(s.key),
        value: (summary as Record<string, number>)[s.key],
        color: s.color,
      }))
    : [];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        subtitle={
          totalUnits > 0
            ? t("subtitle", {
                count: String(totalUnits),
                buildings: String(buildings.length),
              })
            : undefined
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 me-1" />
              {t("bulkImport")}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 me-1" />
              {t("addUnit")}
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Building selector */}
        <Select
          value={selectedBuildingId}
          onValueChange={(v) => setSelectedBuildingId(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder={t("selectBuilding")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allBuildings")}</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {locale === "ar" ? b.nameAr : b.name} ({b.unitsCount || b.units?.length || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_SEGMENTS.map(({ key, color }) => (
            <button
              key={key}
              onClick={() => toggleStatusFilter(key)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                statusFilter.includes(key)
                  ? `${color} text-white border-transparent`
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  statusFilter.includes(key) ? "bg-white" : color
                )}
              />
              {statusT(key)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ms-auto">
          {/* Search */}
          <div className="relative w-48">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="ps-9 h-9 text-sm"
              dir="auto"
            />
          </div>

          {/* View toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
          >
            <ToggleGroupItem value="grid" aria-label={t("gridView")}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label={t("tableView")}>
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Status Summary Bar */}
      {!summaryLoading && summary && totalUnits > 0 && (
        <Card>
          <CardContent className="py-3 px-4">
            <SegmentedProgressBar
              segments={summarySegments}
              total={totalUnits}
              showLegend
              showPercentage
              height="sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {gridsLoading ? (
        viewMode === "grid" ? (
          <UnitGridSkeleton />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : !grids || grids.length === 0 ? (
        <EmptyState
          illustration="building"
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="space-y-6">
          {/* Building tabs if multiple */}
          {grids.length > 1 && (
            <Tabs
              value={selectedBuildingId || grids[0].buildingId}
              onValueChange={setSelectedBuildingId}
            >
              <TabsList>
                {grids.map((grid) => (
                  <TabsTrigger key={grid.buildingId} value={grid.buildingId}>
                    {locale === "ar" ? grid.nameAr : grid.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Grid */}
          {grids.map((grid) => (
            <div
              key={grid.buildingId}
              className={cn(
                selectedBuildingId &&
                  selectedBuildingId !== grid.buildingId &&
                  "hidden"
              )}
            >
              {grids.length > 1 && !selectedBuildingId && (
                <h3 className="text-sm font-semibold mb-2">
                  {locale === "ar" ? grid.nameAr : grid.name}
                </h3>
              )}
              <Card>
                <CardContent className="p-4 overflow-x-auto">
                  <UnitGrid
                    building={grid}
                    selectedUnits={selectedIds}
                    onUnitClick={handleUnitClick}
                    onUnitSelect={toggleSelect}
                    filters={{
                      status: statusFilter.length ? statusFilter : undefined,
                      type: typeFilter.length ? typeFilter : undefined,
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {STATUS_SEGMENTS.map(({ key, color }) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("h-3 w-3 rounded", color)} />
                <span>{statusT(key)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          units.length > 0 &&
                          units.every((u: { id: string }) => isSelected(u.id))
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            units.forEach((u: { id: string }) => {
                              if (!isSelected(u.id)) toggleSelect(u.id);
                            });
                          } else {
                            clearSelection();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>{t("table.unitNumber")}</TableHead>
                    <TableHead>{t("table.floor")}</TableHead>
                    <TableHead>{t("table.building")}</TableHead>
                    <TableHead>{t("table.type")}</TableHead>
                    <TableHead className="text-end">{t("table.area")}</TableHead>
                    <TableHead className="text-end">{t("table.price")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.tenant")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <EmptyState
                          illustration="search"
                          title={t("empty.noResults")}
                          description={t("empty.noResultsDescription")}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    units.map((unit) => (
                      <TableRow
                        key={unit.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          isSelected(unit.id) && "bg-muted"
                        )}
                        onClick={() => handleUnitClick(unit.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected(unit.id)}
                            onCheckedChange={() => toggleSelect(unit.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {unit.number}
                        </TableCell>
                        <TableCell>{unit.floor}</TableCell>
                        <TableCell>
                          {locale === "ar"
                            ? unit.buildingNameAr || unit.buildingName
                            : unit.buildingName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {typeT(unit.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">{unit.area}</TableCell>
                        <TableCell className="text-end">
                          {unit.pricing?.annualRent
                            ? formatCurrency(
                                unit.pricing.annualRent,
                                locale === "ar" ? "ar-SA" : "en-SA"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={unit.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {unit.tenant
                            ? locale === "ar"
                              ? unit.tenant.nameAr || unit.tenant.name
                              : unit.tenant.name
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onChangeStatus={handleChangeStatus}
        onExport={handleExport}
        onClearSelection={clearSelection}
      />

      {/* Unit Detail Sheet */}
      {selectedUnitId && (
        <UnitDetailSheet
          unitId={selectedUnitId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}
