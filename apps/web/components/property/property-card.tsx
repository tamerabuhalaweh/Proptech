"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Building2, MoreHorizontal, Eye, Pencil, Archive, Trash2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PropertySummary } from "@/lib/types";

interface PropertyCardProps {
  property: PropertySummary;
  variant?: "grid" | "list";
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500 text-white",
  under_construction: "bg-amber-500 text-white",
  completed: "bg-blue-500 text-white",
  archived: "bg-gray-500 text-white",
};

export function PropertyCard({
  property,
  variant = "grid",
  onView,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const t = useTranslations("properties");
  const statusT = useTranslations("propertyStatus");
  const typeT = useTranslations("propertyType");
  const locale = useLocale();

  const name = locale === "ar" ? property.nameAr : property.name;
  const city = locale === "ar" ? property.address.cityAr : property.address.city;
  const district = locale === "ar" ? property.address.districtAr : property.address.district;

  if (variant === "list") {
    return (
      <Card
        className="group cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => onView?.(property.id)}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* Thumbnail */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {property.coverImage?.url ? (
              <img
                src={property.coverImage.url}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{district}, {city}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold">{property.stats.totalUnits}</p>
              <p className="text-xs text-muted-foreground">{t("card.units", { count: "" }).trim()}</p>
            </div>
            <div className="text-center w-24">
              <div className="flex items-center gap-2">
                <Progress value={property.stats.occupancyRate} className="h-1.5" />
                <span className="text-xs font-medium">{property.stats.occupancyRate}%</span>
              </div>
            </div>
            <div className="text-end">
              <p className="font-semibold">
                {formatCurrency(property.stats.revenueMTD, locale === "ar" ? "ar-SA" : "en-SA", true)}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <Badge className={cn("shrink-0", statusColors[property.status])}>
            {statusT(property.status)}
          </Badge>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(property.id); }}>
                <Eye className="h-4 w-4 me-2" />
                {t("card.viewProperty")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(property.id); }}>
                <Pencil className="h-4 w-4 me-2" />
                {t("card.editProperty")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(property.id); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t("card.deleteProperty")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
      onClick={() => onView?.(property.id)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {property.coverImage?.url ? (
          <img
            src={property.coverImage.url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {/* Status overlay badge */}
        <Badge
          className={cn(
            "absolute top-2 end-2 text-xs",
            statusColors[property.status]
          )}
        >
          {statusT(property.status)}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Name + Location */}
        <h3 className="font-semibold text-base leading-tight line-clamp-1">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{district}, {city}</span>
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold">{property.stats.totalUnits}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {locale === "ar" ? "وحدة" : "units"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{property.stats.occupancyRate}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {locale === "ar" ? "إشغال" : "occ."}
            </p>
          </div>
          <Badge variant="outline" className="ms-auto text-xs">
            {typeT(property.type)}
          </Badge>
        </div>

        {/* Occupancy progress bar */}
        <Progress
          value={property.stats.occupancyRate}
          className="mt-3 h-1.5"
        />

        {/* Action row (visible on hover for desktop) */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:flex">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(property.id);
            }}
          >
            {t("card.viewProperty")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(property.id); }}>
                <Pencil className="h-4 w-4 me-2" />
                {t("card.editProperty")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(property.id); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t("card.deleteProperty")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton variants
export function PropertyCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-1.5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="ms-auto h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </CardContent>
    </Card>
  );
}
