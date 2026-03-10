"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Send, Edit } from "lucide-react";
import { TEMPLATE_CATEGORY_CONFIG } from "@/lib/mock-communications";
import type { EmailTemplate } from "@/lib/types";

interface TemplateCardProps {
  template: EmailTemplate;
  onToggleActive?: (id: string, active: boolean) => void;
  onEdit?: (id: string) => void;
  onSend?: (id: string) => void;
}

export function TemplateCard({
  template,
  onToggleActive,
  onEdit,
  onSend,
}: TemplateCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const categoryConfig = TEMPLATE_CATEGORY_CONFIG[template.category];

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {isAr ? template.nameAr : template.name}
          </CardTitle>
          <Switch
            checked={template.isActive}
            onCheckedChange={(checked) => onToggleActive?.(template.id, checked)}
            aria-label={isAr ? "تفعيل/تعطيل" : "Toggle active"}
          />
        </div>
        <Badge
          className={cn(
            "border-transparent font-medium text-xs w-fit",
            categoryConfig.bgClass,
            categoryConfig.color
          )}
        >
          {isAr ? categoryConfig.labelAr : categoryConfig.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {isAr ? "الموضوع" : "Subject"}
          </p>
          <p className="text-sm truncate">
            {isAr && template.subjectAr ? template.subjectAr : template.subject}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {isAr ? "المتغيرات" : "Variables"}
          </p>
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 3).map((v) => (
              <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0">
                {`{{${v}}}`}
              </Badge>
            ))}
            {template.variables.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{template.variables.length - 3}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(template.id)}
          >
            <Edit className="h-3.5 w-3.5 me-1" />
            {isAr ? "تعديل" : "Edit"}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSend?.(template.id)}
            disabled={!template.isActive}
          >
            <Send className="h-3.5 w-3.5 me-1" />
            {isAr ? "إرسال" : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
