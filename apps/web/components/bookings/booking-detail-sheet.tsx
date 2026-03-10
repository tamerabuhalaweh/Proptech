"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Building2,
  User,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import { BookingStatusBadge } from "./booking-status-badge";
import { useBooking, useCancelBooking, useConfirmBooking, useCompleteBooking } from "@/hooks/api/use-bookings";
import type { Booking } from "@/lib/types";

interface BookingDetailSheetProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailSheet({ bookingId, open, onOpenChange }: BookingDetailSheetProps) {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: booking, isLoading } = useBooking(bookingId || "");
  const confirmMutation = useConfirmBooking();
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!bookingId) return null;

  const handleCancel = () => {
    if (bookingId && cancelReason.trim()) {
      cancelMutation.mutate({ id: bookingId, reason: cancelReason });
      setCancelDialogOpen(false);
      setCancelReason("");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              {isLoading || !booking ? (
                <BookingDetailSkeleton />
              ) : (
                <>
                  <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                      <SheetTitle>{t("detail.title", { id: booking.id })}</SheetTitle>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </SheetHeader>

                  {/* Status Timeline */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3">{t("detail.timeline")}</h4>
                    <StatusTimeline booking={booking} />
                  </div>

                  <Separator />

                  {/* Unit Card */}
                  <div className="my-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t("detail.unitInfo")}
                    </h4>
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-sm font-medium">{t("detail.unit")}: {booking.unitNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? booking.buildingNameAr : booking.buildingName}
                        {" — "}
                        {isAr ? booking.propertyNameAr : booking.propertyName}
                      </p>
                    </div>
                  </div>

                  {/* Client Card */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("detail.clientInfo")}
                    </h4>
                    <div className="rounded-lg border p-3 space-y-1">
                      <p className="text-sm font-medium">{isAr ? booking.client.nameAr : booking.client.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.client.phone}</p>
                      {booking.client.email && (
                        <p className="text-xs text-muted-foreground">{booking.client.email}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Plan Breakdown */}
                  <div className="my-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t("detail.paymentPlan")}
                    </h4>
                    <div className="space-y-2">
                      <DetailRow
                        label={t("wizard.totalPrice")}
                        value={<CurrencyDisplay amount={booking.paymentPlan.totalPrice} className="font-semibold" />}
                      />
                      <DetailRow
                        label={t("wizard.downPayment")}
                        value={<CurrencyDisplay amount={booking.paymentPlan.downPayment} />}
                      />
                      <DetailRow
                        label={t("wizard.installments")}
                        value={`${booking.paymentPlan.installmentCount}x`}
                      />
                      <DetailRow
                        label={t("wizard.installmentAmount")}
                        value={<CurrencyDisplay amount={booking.paymentPlan.installmentAmount} />}
                      />
                    </div>

                    {/* Installment Schedule */}
                    <div className="mt-3 max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="py-1 text-start font-medium">#</th>
                            <th className="py-1 text-start font-medium">{t("detail.dueDate")}</th>
                            <th className="py-1 text-end font-medium">{tCommon("price")}</th>
                            <th className="py-1 text-end font-medium">{tCommon("status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.paymentPlan.schedule.map((inst) => (
                            <tr key={inst.number} className="border-b last:border-0">
                              <td className="py-1.5">{inst.number}</td>
                              <td className="py-1.5">
                                <DateDisplay date={inst.dueDate} format="short" />
                              </td>
                              <td className="py-1.5 text-end">
                                <CurrencyDisplay amount={inst.amount} />
                              </td>
                              <td className="py-1.5 text-end">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5",
                                    inst.status === "paid" && "text-emerald-600 border-emerald-200",
                                    inst.status === "overdue" && "text-red-600 border-red-200",
                                    inst.status === "pending" && "text-gray-500"
                                  )}
                                >
                                  {t(`installmentStatus.${inst.status}`)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cancel Reason */}
                  {booking.cancelReason && (
                    <>
                      <Separator />
                      <div className="my-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          {t("detail.cancelReason")}
                        </h4>
                        <p className="text-sm text-muted-foreground">{booking.cancelReason}</p>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          className="flex-1"
                          onClick={() => confirmMutation.mutate(booking.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("actions.confirm")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => setCancelDialogOpen(true)}
                        >
                          <XCircle className="h-4 w-4 me-1" />
                          {t("actions.cancel")}
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          className="flex-1"
                          onClick={() => completeMutation.mutate(booking.id)}
                          disabled={completeMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 me-1" />
                          {t("actions.complete")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => setCancelDialogOpen(true)}
                        >
                          <XCircle className="h-4 w-4 me-1" />
                          {t("actions.cancel")}
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancel.title")}</DialogTitle>
            <DialogDescription>{t("cancel.description")}</DialogDescription>
          </DialogHeader>
          <div>
            <Label>{t("cancel.reason")}</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={t("cancel.reasonPlaceholder")}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              {tCommon("back")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {t("actions.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusTimeline({ booking }: { booking: Booking }) {
  const t = useTranslations("bookings.timeline");

  const steps = [
    { key: "created", date: booking.createdAt, active: true },
    {
      key: "confirmed",
      date: booking.confirmedAt,
      active: !!booking.confirmedAt,
    },
    {
      key: booking.status === "cancelled" ? "cancelled" : "completed",
      date: booking.completedAt || booking.cancelledAt,
      active: !!(booking.completedAt || booking.cancelledAt),
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-3 w-3 rounded-full border-2",
                step.active
                  ? step.key === "cancelled"
                    ? "border-red-500 bg-red-500"
                    : "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {t(step.key)}
            </span>
            {step.date && (
              <DateDisplay
                date={step.date}
                format="short"
                className="text-[10px] text-muted-foreground"
              />
            )}
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-1",
                step.active ? "bg-primary" : "bg-muted-foreground/20"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-32" />
      <Separator />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
