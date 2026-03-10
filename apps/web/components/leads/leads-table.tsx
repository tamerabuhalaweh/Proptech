"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  MoreHorizontal,
  ArrowUpDown,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "./score-badge";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { getInitials } from "@/lib/utils";
import { STAGE_COLORS, STAGE_BG_COLORS } from "@/lib/mock-leads";
import type { Lead, LeadStage } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onRowClick: (leadId: string) => void;
  onStageFilter?: (stage: LeadStage | null) => void;
  activeStageFilter?: LeadStage | null;
}

export function LeadsTable({
  leads,
  loading,
  onRowClick,
  onStageFilter,
  activeStageFilter,
}: LeadsTableProps) {
  const t = useTranslations("leads");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedLeads = useMemo(() => {
    const sorted = [...leads];
    const order = sortOrder === "desc" ? -1 : 1;
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.contact.name.localeCompare(b.contact.name) * order;
        case "score":
          return (a.score - b.score) * order;
        case "stage":
          return a.stage.localeCompare(b.stage) * order;
        case "source":
          return a.source.localeCompare(b.source) * order;
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        default:
          return 0;
      }
    });
    return sorted;
  }, [leads, sortBy, sortOrder]);

  const paginatedLeads = sortedLeads.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sortedLeads.length / perPage);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const stages: (LeadStage | null)[] = [null, "new", "contacted", "qualified", "viewing", "negotiation", "won", "lost"];

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stage filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {stages.map((stage) => (
          <Button
            key={stage || "all"}
            variant={activeStageFilter === stage ? "default" : "ghost"}
            size="sm"
            className="text-xs shrink-0"
            onClick={() => onStageFilter?.(stage)}
          >
            {stage ? (
              <span className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", STAGE_COLORS[stage])} />
                {t(`stages.${stage}`)}
              </span>
            ) : (
              tCommon("all")
            )}
          </Button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg text-xs">
          <span className="font-medium">
            {tCommon("selected", { count: selectedIds.size.toString() })}
          </span>
          <Button variant="outline" size="sm" className="text-xs h-7">
            {t("bulkAssign")}
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7">
            {t("bulkStage")}
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7">
            {tCommon("export")}
          </Button>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="text-xs -ms-3" onClick={() => toggleSort("name")}>
                  {tCommon("name")}
                  <ArrowUpDown className="h-3 w-3 ms-1" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="text-xs -ms-3" onClick={() => toggleSort("score")}>
                  {t("score")}
                  <ArrowUpDown className="h-3 w-3 ms-1" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="text-xs -ms-3" onClick={() => toggleSort("stage")}>
                  {t("stage")}
                  <ArrowUpDown className="h-3 w-3 ms-1" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="text-xs -ms-3" onClick={() => toggleSort("source")}>
                  {t("source")}
                  <ArrowUpDown className="h-3 w-3 ms-1" />
                </Button>
              </TableHead>
              <TableHead>{t("assignee")}</TableHead>
              <TableHead>{t("property")}</TableHead>
              <TableHead>{t("lastContact")}</TableHead>
              <TableHead className="w-10">{tCommon("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => {
              const timeAgo = (() => {
                try {
                  return formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true });
                } catch {
                  return "";
                }
              })();

              return (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer"
                  onClick={() => onRowClick(lead.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={() => toggleSelect(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(lead.contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]" dir="auto">
                          {isAr ? lead.contact.nameAr : lead.contact.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {lead.contact.phone && <Phone className="h-3 w-3" />}
                          {lead.contact.email && <Mail className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={lead.score} scoreLabel={lead.scoreLabel} showValue size="sm" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-[10px]",
                        STAGE_BG_COLORS[lead.stage],
                        "border-transparent"
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full me-1", STAGE_COLORS[lead.stage])} />
                      {t(`stages.${lead.stage}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{t(`sources.${lead.source}`)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[8px]">
                          {getInitials(lead.agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs truncate max-w-[80px]">
                        {isAr ? lead.agent.nameAr : lead.agent.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs truncate max-w-[120px]">
                    {lead.interest.bedrooms && `${lead.interest.bedrooms}BR `}
                    {isAr ? lead.interest.propertyTypeAr : lead.interest.propertyType}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowClick(lead.id)}>
                          {tCommon("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>{tCommon("edit")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          {tCommon("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {tCommon("showing", {
              from: String((page - 1) * perPage + 1),
              to: String(Math.min(page * perPage, sortedLeads.length)),
              total: String(sortedLeads.length),
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
