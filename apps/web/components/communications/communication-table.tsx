"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DateDisplay } from "@/components/common/date-display";
import {
  COMMUNICATION_TYPE_CONFIG,
  DIRECTION_CONFIG,
  COMMUNICATION_STATUS_CONFIG,
} from "@/lib/mock-communications";
import type { Communication } from "@/lib/types";

interface CommunicationTableProps {
  communications: Communication[];
  loading?: boolean;
  onRowClick: (id: string) => void;
}

export function CommunicationTable({
  communications,
  loading,
  onRowClick,
}: CommunicationTableProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  if (loading) {
    return <CommunicationTableSkeleton />;
  }

  if (communications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-sm text-muted-foreground">
          {isAr ? "لا توجد اتصالات" : "No communications found"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{isAr ? "النوع" : "Type"}</TableHead>
            <TableHead className="w-12">{isAr ? "الاتجاه" : "Dir"}</TableHead>
            <TableHead>{isAr ? "جهة الاتصال" : "Contact"}</TableHead>
            <TableHead>{isAr ? "الموضوع" : "Subject"}</TableHead>
            <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
            <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communications.map((comm) => {
            const typeConfig = COMMUNICATION_TYPE_CONFIG[comm.type];
            const dirConfig = DIRECTION_CONFIG[comm.direction];
            const statusConfig = COMMUNICATION_STATUS_CONFIG[comm.status];

            return (
              <TableRow
                key={comm.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick(comm.id)}
              >
                <TableCell>
                  <span className="text-lg" title={isAr ? typeConfig.labelAr : typeConfig.label}>
                    {typeConfig.emoji}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                      comm.direction === "inbound"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    )}
                    title={isAr ? dirConfig.labelAr : dirConfig.label}
                  >
                    {dirConfig.emoji}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {isAr ? comm.contact.nameAr : comm.contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comm.contact.email || comm.contact.phone || "—"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm truncate max-w-[200px]">
                    {isAr && comm.subjectAr ? comm.subjectAr : comm.subject}
                  </p>
                  {(comm.leadId || comm.bookingId) && (
                    <p className="text-xs text-muted-foreground">
                      {comm.leadId ? (isAr ? "عميل" : "Lead") : ""}
                      {comm.bookingId ? (isAr ? "حجز" : "Booking") : ""}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-transparent font-medium text-xs",
                      statusConfig.bgClass,
                      statusConfig.color
                    )}
                  >
                    {statusConfig.emoji} {comm.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DateDisplay date={comm.createdAt} showRelative />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function CommunicationTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
