"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUnitDetail } from "@/hooks/api/use-inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";

interface UnitDetailSheetProps {
  unitId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitDetailSheet({
  unitId,
  open,
  onOpenChange,
}: UnitDetailSheetProps) {
  const t = useTranslations("inventory.unitDetail");
  const statusT = useTranslations("unitStatus");
  const typeT = useTranslations("unitType");
  const locale = useLocale();
  const { data: unit, isLoading } = useUnitDetail(unitId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        {isLoading || !unit ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
            <Separator />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                {t("title", { number: unit.number })}
              </SheetTitle>
              <SheetDescription>
                {unit.buildingName && `${locale === "ar" ? unit.buildingNameAr : unit.buildingName}, `}
                {locale === "ar" ? `الطابق ${unit.floor}` : `Floor ${unit.floor}`}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("changeStatus")}</span>
                <StatusBadge status={unit.status} />
              </div>

              <Separator />

              {/* Details */}
              <div>
                <h4 className="text-sm font-semibold mb-3">{t("details")}</h4>
                <div className="space-y-2">
                  <DetailRow label={t("type")} value={typeT(unit.type)} />
                  <DetailRow
                    label={t("area")}
                    value={`${unit.area} m²`}
                  />
                  {unit.bedrooms !== undefined && (
                    <DetailRow
                      label={t("bedrooms")}
                      value={String(unit.bedrooms)}
                    />
                  )}
                  {unit.bathrooms !== undefined && (
                    <DetailRow
                      label={t("bathrooms")}
                      value={String(unit.bathrooms)}
                    />
                  )}
                  {unit.features && (
                    <>
                      <DetailRow
                        label={t("balcony")}
                        value={unit.features.balcony ? t("yes") : t("no")}
                      />
                      {unit.features.view && (
                        <DetailRow
                          label={t("view")}
                          value={
                            locale === "ar"
                              ? unit.features.viewAr || unit.features.view
                              : unit.features.view
                          }
                        />
                      )}
                      {unit.features.parkingSpot && (
                        <DetailRow
                          label={t("parking")}
                          value={unit.features.parkingSpot}
                        />
                      )}
                      <DetailRow
                        label={t("furnished")}
                        value={unit.features.furnished ? t("yes") : t("no")}
                      />
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              {unit.pricing && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">{t("pricing")}</h4>
                  <div className="space-y-2">
                    <DetailRow
                      label={t("annualRent")}
                      value={formatCurrency(
                        unit.pricing.annualRent,
                        locale === "ar" ? "ar-SA" : "en-SA"
                      )}
                    />
                    <DetailRow
                      label={t("pricePerSqm")}
                      value={formatCurrency(
                        unit.pricing.pricePerSqm,
                        locale === "ar" ? "ar-SA" : "en-SA"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Tenant info */}
              {unit.tenant && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      {t("tenantInfo")}
                    </h4>
                    <div className="space-y-2">
                      <DetailRow
                        label={locale === "ar" ? "الاسم" : "Name"}
                        value={
                          locale === "ar"
                            ? unit.tenant.nameAr || unit.tenant.name
                            : unit.tenant.name
                        }
                      />
                      {unit.tenant.leaseStart && (
                        <DetailRow
                          label={t("leaseStart")}
                          value={unit.tenant.leaseStart}
                        />
                      )}
                      {unit.tenant.leaseEnd && (
                        <DetailRow
                          label={t("leaseEnd")}
                          value={unit.tenant.leaseEnd}
                        />
                      )}
                      {unit.tenant.leaseStatus && (
                        <DetailRow
                          label={t("leaseStatus")}
                          value={unit.tenant.leaseStatus}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* History */}
              {unit.history && unit.history.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      {t("history")}
                    </h4>
                    <div className="space-y-3">
                      {unit.history.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm">
                              {locale === "ar"
                                ? entry.actionAr || entry.action
                                : entry.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  {t("editUnit")}
                </Button>
                {unit.status === "available" && (
                  <Link href={`/bookings/new?unitId=${unit.id}`} className="flex-1">
                    <Button className="w-full">
                      {t("bookUnit")}
                    </Button>
                  </Link>
                )}
                {unit.tenant && (
                  <Button variant="outline" className="flex-1">
                    {t("viewLease")}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
