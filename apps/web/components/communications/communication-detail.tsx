"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DateDisplay } from "@/components/common/date-display";
import { Link } from "@/i18n/navigation";
import {
  COMMUNICATION_TYPE_CONFIG,
  DIRECTION_CONFIG,
  COMMUNICATION_STATUS_CONFIG,
} from "@/lib/mock-communications";
import { mockCommunications } from "@/lib/mock-communications";
import type { Communication } from "@/lib/types";

interface CommunicationDetailProps {
  communicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunicationDetail({
  communicationId,
  open,
  onOpenChange,
}: CommunicationDetailProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const communication = communicationId
    ? mockCommunications.find((c) => c.id === communicationId)
    : null;

  if (!communication) return null;

  const typeConfig = COMMUNICATION_TYPE_CONFIG[communication.type];
  const dirConfig = DIRECTION_CONFIG[communication.direction];
  const statusConfig = COMMUNICATION_STATUS_CONFIG[communication.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-xl">{typeConfig.emoji}</span>
            <span>{isAr ? typeConfig.labelAr : typeConfig.label}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Meta info */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(
                "border-transparent font-medium",
                statusConfig.bgClass,
                statusConfig.color
              )}
            >
              {statusConfig.emoji} {communication.status}
            </Badge>
            <Badge variant="outline">
              {dirConfig.emoji}{" "}
              {isAr ? dirConfig.labelAr : dirConfig.label}
            </Badge>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isAr ? "جهة الاتصال" : "Contact"}
            </h4>
            <p className="text-sm font-medium">
              {isAr ? communication.contact.nameAr : communication.contact.name}
            </p>
            {communication.contact.email && (
              <p className="text-xs text-muted-foreground">{communication.contact.email}</p>
            )}
            {communication.contact.phone && (
              <p className="text-xs text-muted-foreground">{communication.contact.phone}</p>
            )}
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isAr ? "الموضوع" : "Subject"}
            </h4>
            <p className="text-sm">
              {isAr && communication.subjectAr
                ? communication.subjectAr
                : communication.subject}
            </p>
          </div>

          <Separator />

          {/* Body */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isAr ? "المحتوى" : "Message"}
            </h4>
            <div className="rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {isAr && communication.bodyAr
                ? communication.bodyAr
                : communication.body}
            </div>
          </div>

          {/* Date */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              {isAr ? "التاريخ" : "Date"}
            </h4>
            <DateDisplay date={communication.createdAt} format="withTime" />
          </div>

          {/* Links */}
          {(communication.leadId || communication.bookingId) && (
            <>
              <Separator />
              <div className="flex gap-2">
                {communication.leadId && (
                  <Link href="/leads">
                    <Button variant="outline" size="sm">
                      {isAr ? "عرض العميل" : "View Lead"}
                    </Button>
                  </Link>
                )}
                {communication.bookingId && (
                  <Link href="/bookings">
                    <Button variant="outline" size="sm">
                      {isAr ? "عرض الحجز" : "View Booking"}
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
