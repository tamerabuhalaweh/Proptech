"use client";

import { useLocale } from "next-intl";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DOCUMENT_CATEGORY_CONFIG } from "@/lib/mock-documents";
import type { DocumentCategory, DocumentEntityType } from "@/lib/types";

interface DocumentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  entityTypeFilter: string;
  onEntityTypeFilterChange: (value: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (value: "grid" | "list") => void;
}

const entityTypes: { value: DocumentEntityType; label: string; labelAr: string }[] = [
  { value: "property", label: "Property", labelAr: "عقار" },
  { value: "unit", label: "Unit", labelAr: "وحدة" },
  { value: "booking", label: "Booking", labelAr: "حجز" },
  { value: "lead", label: "Lead", labelAr: "عميل" },
];

export function DocumentFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  entityTypeFilter,
  onEntityTypeFilterChange,
  showArchived,
  onShowArchivedChange,
  viewMode,
  onViewModeChange,
}: DocumentFiltersProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isAr ? "بحث في المستندات..." : "Search documents..."}
            className="ps-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={isAr ? "الفئة" : "Category"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {DOCUMENT_CATEGORY_CONFIG[cat].emoji}{" "}
                {isAr ? DOCUMENT_CATEGORY_CONFIG[cat].labelAr : DOCUMENT_CATEGORY_CONFIG[cat].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityTypeFilter} onValueChange={onEntityTypeFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={isAr ? "نوع الكيان" : "Entity Type"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
            {entityTypes.map((et) => (
              <SelectItem key={et.value} value={et.value}>
                {isAr ? et.labelAr : et.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && onViewModeChange(v as "grid" | "list")}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 px-2.5">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-9 px-2.5">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={onShowArchivedChange}
        />
        <Label htmlFor="show-archived" className="text-sm text-muted-foreground cursor-pointer">
          {isAr ? "عرض المؤرشف" : "Show archived"}
        </Label>
      </div>
    </div>
  );
}
