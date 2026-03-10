"use client";

import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmailTemplate } from "@/lib/types";

const SAMPLE_DATA: Record<string, string> = {
  leadName: "Mohammed Al-Harbi",
  propertyName: "Al Noor Residence",
  unitNumber: "3B",
  bookingId: "BK-2024-001",
  amount: "50,000",
  dueDate: "March 20, 2026",
  agentName: "Ahmed Al-Qahtani",
  viewingDate: "March 15, 2026",
  viewingTime: "10:00 AM",
  discountPercent: "15",
  offerEndDate: "April 30, 2026",
};

interface TemplatePreviewProps {
  template: EmailTemplate;
}

function replaceVariables(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const subjectText = isAr && template.subjectAr ? template.subjectAr : template.subject;
  const bodyText = isAr && template.bodyAr ? template.bodyAr : template.body;

  const renderedSubject = replaceVariables(subjectText, SAMPLE_DATA);
  const renderedBody = replaceVariables(bodyText, SAMPLE_DATA);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {isAr ? "معاينة" : "Preview"}
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {isAr ? "بيانات تجريبية" : "Sample Data"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-background">
          {/* Email header */}
          <div className="border-b px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{isAr ? "إلى:" : "To:"}</span>
              <span>{SAMPLE_DATA.leadName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground text-xs">
                {isAr ? "الموضوع:" : "Subject:"}
              </span>
              <span className="font-medium">{renderedSubject}</span>
            </div>
          </div>
          {/* Email body */}
          <div className="p-4 text-sm whitespace-pre-wrap leading-relaxed">
            {renderedBody}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
