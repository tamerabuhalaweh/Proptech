"use client";

import { useLocale } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMUNICATION_TYPE_CONFIG, DIRECTION_CONFIG, COMMUNICATION_STATUS_CONFIG } from "@/lib/mock-communications";
import type { CommunicationType, CommunicationDirection, CommunicationStatus } from "@/lib/types";

interface CommunicationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  directionFilter: string;
  onDirectionFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function CommunicationFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  directionFilter,
  onDirectionFilterChange,
  statusFilter,
  onStatusFilterChange,
}: CommunicationFiltersProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isAr ? "بحث في الاتصالات..." : "Search communications..."}
          className="ps-9"
        />
      </div>
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={isAr ? "النوع" : "Type"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
          {(Object.keys(COMMUNICATION_TYPE_CONFIG) as CommunicationType[]).map((type) => (
            <SelectItem key={type} value={type}>
              {COMMUNICATION_TYPE_CONFIG[type].emoji}{" "}
              {isAr ? COMMUNICATION_TYPE_CONFIG[type].labelAr : COMMUNICATION_TYPE_CONFIG[type].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={directionFilter} onValueChange={onDirectionFilterChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={isAr ? "الاتجاه" : "Direction"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
          {(Object.keys(DIRECTION_CONFIG) as CommunicationDirection[]).map((dir) => (
            <SelectItem key={dir} value={dir}>
              {DIRECTION_CONFIG[dir].emoji}{" "}
              {isAr ? DIRECTION_CONFIG[dir].labelAr : DIRECTION_CONFIG[dir].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={isAr ? "الحالة" : "Status"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
          {(Object.keys(COMMUNICATION_STATUS_CONFIG) as CommunicationStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {COMMUNICATION_STATUS_CONFIG[status].emoji}{" "}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
