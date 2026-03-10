"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  X,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/property-card";
import { CreatePropertySheet } from "@/components/property/create-property-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProperties } from "@/hooks/api/use-properties";
import type { PropertySummary } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

type ViewMode = "grid" | "list";
type SortOption = { key: string; order: "asc" | "desc"; label: string };

const PROPERTY_TYPES = ["residential", "commercial", "mixed", "land"] as const;
const PROPERTY_STATUSES = ["active", "under_construction", "completed", "archived"] as const;
const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Madinah", "Tabuk", "Abha"] as const;

export default function PropertiesPage() {
  const t = useTranslations("properties");
  const commonT = useTranslations("common");
  const typeT = useTranslations("propertyType");
  const statusT = useTranslations("propertyStatus");
  const locale = useLocale();
  const router = useRouter();

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [searchInput, setSearchInput] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedCities, setSelectedCities] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Map sort option to API params
  const sortConfig = React.useMemo((): { sortBy?: string; sortOrder?: "asc" | "desc" } => {
    switch (sortBy) {
      case "nameAsc": return { sortBy: "name", sortOrder: "asc" };
      case "nameDesc": return { sortBy: "name", sortOrder: "desc" };
      case "occupancyHigh": return { sortBy: "occupancy", sortOrder: "desc" };
      case "occupancyLow": return { sortBy: "occupancy", sortOrder: "asc" };
      case "unitsHigh": return { sortBy: "units", sortOrder: "desc" };
      case "unitsLow": return { sortBy: "units", sortOrder: "asc" };
      case "revenueHigh": return { sortBy: "revenue", sortOrder: "desc" };
      case "revenueLow": return { sortBy: "revenue", sortOrder: "asc" };
      default: return {};
    }
  }, [sortBy]);

  // Query
  const { data, isLoading } = useProperties({
    search: debouncedSearch || undefined,
    type: selectedTypes.length ? selectedTypes : undefined,
    status: selectedStatuses.length ? selectedStatuses : undefined,
    city: selectedCities.length ? selectedCities : undefined,
    page,
    perPage: 12,
    ...sortConfig,
  });

  const properties: PropertySummary[] = data?.data || [];
  const pagination = data?.pagination;

  const hasFilters = selectedTypes.length > 0 || selectedStatuses.length > 0 || selectedCities.length > 0;
  const activeFilterCount = selectedTypes.length + selectedStatuses.length + selectedCities.length;

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedCities([]);
    setSearchInput("");
    setPage(1);
  };

  const toggleFilter = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  };

  const handleViewProperty = (id: string) => {
    router.push(`/${locale}/properties/${id}`);
  };

  // Sort options
  const sortOptions = [
    { key: "newest", label: t("sort.newest") },
    { key: "oldest", label: t("sort.oldest") },
    { key: "nameAsc", label: t("sort.nameAsc") },
    { key: "nameDesc", label: t("sort.nameDesc") },
    { key: "occupancyHigh", label: t("sort.occupancyHigh") },
    { key: "occupancyLow", label: t("sort.occupancyLow") },
    { key: "revenueHigh", label: t("sort.revenueHigh") },
    { key: "revenueLow", label: t("sort.revenueLow") },
  ];

  // Filter sidebar content (shared between desktop and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Type filter */}
      <div>
        <h4 className="text-sm font-semibold mb-2">{t("filters.type")}</h4>
        <div className="space-y-1">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                className="rounded"
              />
              {typeT(type)}
            </label>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div>
        <h4 className="text-sm font-semibold mb-2">{t("filters.status")}</h4>
        <div className="space-y-1">
          {PROPERTY_STATUSES.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)}
                className="rounded"
              />
              {statusT(status)}
            </label>
          ))}
        </div>
      </div>

      {/* City filter */}
      <div>
        <h4 className="text-sm font-semibold mb-2">{t("filters.city")}</h4>
        <div className="space-y-1">
          {CITIES.map((city) => (
            <label
              key={city}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selectedCities.includes(city)}
                onChange={() => toggleFilter(selectedCities, setSelectedCities, city)}
                className="rounded"
              />
              {city}
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="w-full" onClick={clearAllFilters}>
          {t("filters.clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        subtitle={pagination ? t("subtitle", { count: String(pagination.total) }) : undefined}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("addProperty")}
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="ps-9 pe-9"
            dir="auto"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setPage(1); }}
              className="absolute end-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filter button (mobile) */}
        <Button
          variant="outline"
          size="sm"
          className="sm:hidden"
          onClick={() => setFilterSheetOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4 me-1" />
          {commonT("filter")}
          {activeFilterCount > 0 && (
            <Badge className="ms-1 h-5 w-5 p-0 text-[10px] rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-2 ms-auto">
          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 me-1" />
                {t("sortBy")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.key}
                  onClick={() => { setSortBy(option.key); setPage(1); }}
                  className={sortBy === option.key ? "bg-muted" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="hidden sm:inline-flex"
          >
            <ToggleGroupItem value="grid" aria-label={t("gridView")}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label={t("listView")}>
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1 pe-1">
              {typeT(type)}
              <button onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1 pe-1">
              {statusT(status)}
              <button onClick={() => toggleFilter(selectedStatuses, setSelectedStatuses, status)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCities.map((city) => (
            <Badge key={city} variant="secondary" className="gap-1 pe-1">
              {city}
              <button onClick={() => toggleFilter(selectedCities, setSelectedCities, city)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {commonT("clearAll")}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20">
            <h3 className="text-sm font-semibold mb-4">{commonT("filter")}</h3>
            <FilterContent />
          </div>
        </aside>

        {/* Property list / grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "space-y-3"
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} variant={viewMode} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            debouncedSearch || hasFilters ? (
              <EmptyState
                illustration="search"
                title={t("emptySearch.title")}
                description={t("emptySearch.description")}
                action={{
                  label: t("emptySearch.clearFilters"),
                  onClick: clearAllFilters,
                  variant: "outline",
                }}
              />
            ) : (
              <EmptyState
                illustration="building"
                title={t("empty.title")}
                description={t("empty.description")}
                action={{
                  label: t("empty.addFirst"),
                  onClick: () => setCreateOpen(true),
                }}
              />
            )
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-3"
                }
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant={viewMode}
                    onView={handleViewProperty}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {commonT("showing", {
                      from: String((pagination.page - 1) * pagination.perPage + 1),
                      to: String(
                        Math.min(
                          pagination.page * pagination.perPage,
                          pagination.total
                        )
                      ),
                      total: String(pagination.total),
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {commonT("back")}
                    </Button>
                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {commonT("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{commonT("filter")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Create property sheet */}
      <CreatePropertySheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
