"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/hooks/api/use-bookings";
import type { Booking, BookingStatus } from "@/lib/types";

const statusOptions: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "expired",
  "completed",
];

export default function BookingsPage() {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useBookings({
    search: search || undefined,
    status: statusFilter !== "all" ? [statusFilter] : undefined,
  });

  const bookings = (data?.data || []) as Booking[];

  const openDetail = (id: string) => {
    setSelectedBookingId(id);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { count: bookings.length })}
        actions={
          <Link href="/bookings/new">
            <Button>
              <Plus className="h-4 w-4 me-1" />
              {t("newBooking")}
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon("all")}</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <BookingsTableSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          illustration="inbox"
          title={t("empty.title")}
          description={t("empty.description")}
          action={{
            label: t("newBooking"),
            onClick: () => {},
          }}
        />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.unit")}</TableHead>
                <TableHead>{t("table.client")}</TableHead>
                <TableHead>{tCommon("status")}</TableHead>
                <TableHead className="text-end">{t("table.totalPrice")}</TableHead>
                <TableHead>{t("table.createdAt")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openDetail(booking.id)}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{booking.unitNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? booking.propertyNameAr : booking.propertyName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {isAr ? booking.client.nameAr : booking.client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.client.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-end">
                    <CurrencyDisplay amount={booking.paymentPlan.totalPrice} />
                  </TableCell>
                  <TableCell>
                    <DateDisplay date={booking.createdAt} showRelative />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(booking.id)}>
                          <Eye className="h-4 w-4 me-2" />
                          {tCommon("view")}
                        </DropdownMenuItem>
                        {booking.status === "pending" && (
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 me-2" />
                            {t("actions.confirm")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BookingDetailSheet
        bookingId={selectedBookingId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

function BookingsTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
