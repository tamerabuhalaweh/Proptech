"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Grid3X3,
  PieChart,
  TrendingUp,
  DollarSign,
  Pencil,
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Car,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/common/page-header";
import { KPICard } from "@/components/common/kpi-card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useProperty } from "@/hooks/api/use-properties";

const STATUS_COLORS: Record<string, string> = {
  available: "#16A34A",
  reserved: "#D97706",
  occupied: "#2563EB",
  blocked: "#DC2626",
  maintenance: "#6B7280",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("propertyDetail");
  const statusT = useTranslations("unitStatus");
  const typeT = useTranslations("propertyType");
  const propStatusT = useTranslations("propertyStatus");
  const commonT = useTranslations("common");

  const propertyId = params.id as string;
  const { data: property, isLoading } = useProperty(propertyId);

  const [activeTab, setActiveTab] = React.useState("overview");

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <EmptyState
        illustration="building"
        title="Property not found"
        description="The property you're looking for doesn't exist."
        action={{
          label: commonT("back"),
          onClick: () => router.push(`/${locale}/properties`),
        }}
      />
    );
  }

  const name = locale === "ar" ? property.nameAr : property.name;
  const city = locale === "ar" ? property.address.cityAr : property.address.city;
  const district = locale === "ar" ? property.address.districtAr : property.address.district;

  // Unit status data for donut chart
  const unitStatusData = [
    { name: statusT("available"), value: property.stats.availableUnits || 0, color: STATUS_COLORS.available },
    { name: statusT("reserved"), value: property.stats.reservedUnits || 0, color: STATUS_COLORS.reserved },
    { name: statusT("occupied"), value: property.stats.occupiedUnits || 0, color: STATUS_COLORS.occupied },
    { name: statusT("blocked"), value: property.stats.blockedUnits || 0, color: STATUS_COLORS.blocked },
  ].filter((d) => d.value > 0);

  // All units flat list for Units tab
  const allUnits = property.buildings?.flatMap((b) =>
    (b.units || []).map((u) => ({
      ...u,
      buildingName: locale === "ar" ? b.nameAr : b.name,
    }))
  ) || [];

  // Pricing summary
  const prices = allUnits
    .filter((u) => u.pricing?.annualRent)
    .map((u) => u.pricing!.annualRent);
  const avgRent = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minRent = prices.length > 0 ? Math.min(...prices) : 0;
  const maxRent = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}`}>
              {commonT("overview")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/${locale}/properties`}>
              {t("breadcrumb.properties")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Property Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          {/* Thumbnail */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            {property.coverImage?.url ? (
              <img
                src={property.coverImage.url}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{name}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{district}, {city}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-emerald-500 text-white">
                {propStatusT(property.status)}
              </Badge>
              <Badge variant="outline">{typeT(property.type)}</Badge>
              {property.details?.numberOfFloors && (
                <Badge variant="secondary">
                  <Layers className="h-3 w-3 me-1" />
                  {property.details.numberOfFloors} {locale === "ar" ? "طابق" : "Floors"}
                </Badge>
              )}
              {property.details?.parkingSpots && (
                <Badge variant="secondary">
                  <Car className="h-3 w-3 me-1" />
                  {property.details.parkingSpots} {locale === "ar" ? "موقف" : "Parking"}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 me-1" />
              {commonT("edit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="units">
            {t("tabs.units")}
            {allUnits.length > 0 && (
              <Badge variant="secondary" className="ms-1.5 text-[10px] px-1.5">
                {allUnits.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing">{t("tabs.pricing")}</TabsTrigger>
          <TabsTrigger value="media">{t("tabs.media")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="propertyDetail.overview.kpi.totalUnits"
              value={property.stats.totalUnits}
              icon={Grid3X3}
              iconColor="text-primary"
            />
            <KPICard
              label="propertyDetail.overview.kpi.occupancyRate"
              value={property.stats.occupancyRate}
              formattedValue={`${property.stats.occupancyRate}%`}
              icon={PieChart}
              iconColor="text-info"
            />
            <KPICard
              label="propertyDetail.overview.kpi.revenueMTD"
              value={property.stats.revenueMTD}
              formattedValue={formatCurrency(
                property.stats.revenueMTD,
                locale === "ar" ? "ar-SA" : "en-SA",
                true
              )}
              icon={TrendingUp}
              iconColor="text-success"
            />
            <KPICard
              label="propertyDetail.overview.kpi.avgRentSqm"
              value={property.stats.avgRentPerSqm || 0}
              formattedValue={`${formatNumber(property.stats.avgRentPerSqm || 0, locale === "ar" ? "ar-SA" : "en-SA")} ${locale === "ar" ? "ر.س" : "SAR"}`}
              icon={DollarSign}
              iconColor="text-warning"
            />
          </div>

          {/* Two-column layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unit status donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("overview.unitStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unitStatusData.length > 0 ? (
                  <>
                    <div className="relative h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={unitStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {unitStatusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-md">
                                  <p className="text-sm font-medium">
                                    {payload[0].name}: {payload[0].value}
                                  </p>
                                </div>
                              );
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold">
                          {property.stats.totalUnits}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {locale === "ar" ? "إجمالي" : "Total"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {unitStatusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs text-muted-foreground truncate">
                            {item.name}
                          </span>
                          <span className="ms-auto text-xs font-medium">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title={t("empty.noUnits")}
                    description={t("empty.noUnitsDescription")}
                  />
                )}
              </CardContent>
            </Card>

            {/* Property details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("overview.propertyDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.details?.yearBuilt && (
                    <DetailRow
                      label={t("overview.yearBuilt")}
                      value={property.details.yearBuilt}
                    />
                  )}
                  {property.details?.totalArea && (
                    <DetailRow
                      label={t("overview.totalArea")}
                      value={`${formatNumber(property.details.totalArea, locale === "ar" ? "ar-SA" : "en-SA")} ${t("overview.sqm")}`}
                    />
                  )}
                  {property.details?.numberOfFloors && (
                    <DetailRow
                      label={t("overview.floors")}
                      value={String(property.details.numberOfFloors)}
                    />
                  )}
                  {property.details?.parkingSpots && (
                    <DetailRow
                      label={t("overview.parkingSpots")}
                      value={String(property.details.parkingSpots)}
                    />
                  )}
                  {property.details?.developer && (
                    <DetailRow
                      label={t("overview.developer")}
                      value={
                        locale === "ar"
                          ? property.details.developerAr || property.details.developer
                          : property.details.developer
                      }
                    />
                  )}
                  {property.manager && (
                    <DetailRow
                      label={t("overview.manager")}
                      value={property.manager.name}
                    />
                  )}
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3">
                      {t("overview.amenities")}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs"
                        >
                          <span>
                            {locale === "ar" ? amenity.nameAr : amenity.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Buildings list */}
          {property.buildings && property.buildings.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("overview.buildings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {property.buildings.map((building) => (
                    <div
                      key={building.id}
                      className="rounded-lg border p-4"
                    >
                      <h4 className="font-semibold">
                        {locale === "ar" ? building.nameAr : building.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {building.floors} {locale === "ar" ? "طابق" : "floors"}
                        {" · "}
                        {building.unitsCount || building.units?.length || 0}{" "}
                        {locale === "ar" ? "وحدة" : "units"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units">
          {allUnits.length === 0 ? (
            <EmptyState
              illustration="building"
              title={t("empty.noUnits")}
              description={t("empty.noUnitsDescription")}
            />
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("units.title")} ({allUnits.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("units.unitNumber")}</TableHead>
                        <TableHead>{t("units.floor")}</TableHead>
                        <TableHead>{t("units.type")}</TableHead>
                        <TableHead className="text-end">
                          {t("units.area")}
                        </TableHead>
                        <TableHead className="text-end">
                          {t("units.price")}
                        </TableHead>
                        <TableHead>{t("units.status")}</TableHead>
                        <TableHead>{t("units.tenant")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUnits.slice(0, 50).map((unit) => (
                        <TableRow key={unit.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-mono font-medium">
                            {unit.number}
                          </TableCell>
                          <TableCell>{unit.floor}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {unit.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">
                            {unit.area}
                          </TableCell>
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
                          <TableCell className="text-muted-foreground text-sm">
                            {unit.tenant
                              ? locale === "ar"
                                ? unit.tenant.nameAr
                                : unit.tenant.name
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          {prices.length === 0 ? (
            <EmptyState
              illustration="chart"
              title={t("empty.noPricing")}
            />
          ) : (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("pricing.avgRent")}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      <CurrencyDisplay amount={avgRent} />
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("pricing.minRent")}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      <CurrencyDisplay amount={minRent} />
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t("pricing.maxRent")}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      <CurrencyDisplay amount={maxRent} />
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Discount requests placeholder */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {t("pricing.discountRequests")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("pricing.noDiscounts")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          {!property.images || property.images.length === 0 ? (
            <EmptyState
              illustration="inbox"
              title={t("media.noMedia")}
              description={t("media.noMediaDescription")}
              action={{
                label: t("media.uploadButton"),
                onClick: () => {},
              }}
            />
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("media.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Category filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {[
                    { key: "all", label: t("media.allMedia") },
                    { key: "exterior", label: t("media.exterior") },
                    { key: "interior", label: t("media.interior") },
                    { key: "floorPlans", label: t("media.floorPlans") },
                  ].map((cat) => (
                    <Badge
                      key={cat.key}
                      variant="secondary"
                      className="cursor-pointer whitespace-nowrap"
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>

                {/* Gallery grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {property.images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                    >
                      <img
                        src={image.url}
                        alt={locale === "ar" ? image.titleAr || image.title : image.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                        <p className="absolute bottom-2 start-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {locale === "ar" ? image.titleAr || image.title : image.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Detail row helper
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// Loading skeleton
function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <Card>
        <CardContent className="flex gap-4 p-6">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-96" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
