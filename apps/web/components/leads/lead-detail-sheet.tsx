"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronRight,
  X,
  Tag,
  User,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScoreBadge } from "./score-badge";
import { ActivityTimeline } from "./activity-timeline";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { getInitials } from "@/lib/utils";
import { useLead, useLeadActivities } from "@/hooks/api/use-leads";
import { LEAD_STAGES, STAGE_COLORS, STAGE_BG_COLORS } from "@/lib/mock-leads";
import type { LeadStage } from "@/lib/types";

interface LeadDetailSheetProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ leadId, open, onOpenChange }: LeadDetailSheetProps) {
  const t = useTranslations("leads");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: lead, isLoading: leadLoading } = useLead(leadId || "");
  const { data: activities, isLoading: activitiesLoading } = useLeadActivities(leadId || "");

  const [followUpType, setFollowUpType] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  if (!leadId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {leadLoading || !lead ? (
              <LeadDetailSkeleton />
            ) : (
              <>
                {/* Header */}
                <SheetHeader className="mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <SheetTitle className="text-xl" dir="auto">
                        {isAr ? lead.contact.nameAr : lead.contact.name}
                      </SheetTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ScoreBadge score={lead.score} scoreLabel={lead.scoreLabel} showValue />
                        <Badge
                          className={cn(
                            "text-xs",
                            STAGE_BG_COLORS[lead.stage],
                            "border-transparent"
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full me-1", STAGE_COLORS[lead.stage])} />
                          {t(`stages.${lead.stage}`)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {t(`sources.${lead.source}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">
                      {tCommon("overview")}
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1">
                      {t("activity")}
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1">
                      {t("notesTab")}
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-5">
                    {/* Contact */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{t("contact")}</h3>
                      <div className="space-y-2">
                        <a
                          href={`tel:${lead.contact.phone}`}
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span dir="ltr">{lead.contact.phone}</span>
                        </a>
                        {lead.contact.email && (
                          <a
                            href={`mailto:${lead.contact.email}`}
                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.contact.email}</span>
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${lead.contact.phone.replace(/\+/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <Separator />

                    {/* Interest */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{t("interest")}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {lead.interest.bedrooms && `${lead.interest.bedrooms}BR `}
                            {isAr ? lead.interest.propertyTypeAr : lead.interest.propertyType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {isAr
                              ? (lead.interest.districtAr ? `${lead.interest.districtAr}، ${lead.interest.cityAr}` : lead.interest.cityAr)
                              : (lead.interest.district ? `${lead.interest.district}, ${lead.interest.city}` : lead.interest.city)
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <CurrencyDisplay amount={lead.interest.budgetMin} compact className="text-sm" />
                            {" - "}
                            <CurrencyDisplay amount={lead.interest.budgetMax} compact className="text-sm" />
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{t(`timelines.${lead.interest.timeline}`)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold mb-2">{t("tags")}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {lead.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 me-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Assigned Agent */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{t("assignedAgent")}</h3>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(lead.agent.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {isAr ? lead.agent.nameAr : lead.agent.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Stage actions */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{t("changeStage")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {LEAD_STAGES.filter((s) => s !== lead.stage).map((stage) => (
                          <Button
                            key={stage}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <span className={cn("h-2 w-2 rounded-full me-1.5", STAGE_COLORS[stage])} />
                            {t(`stages.${stage}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="space-y-4">
                    {/* Follow-up scheduler */}
                    <div className="rounded-lg border p-3 space-y-3">
                      <h4 className="text-sm font-semibold">{t("scheduleFollowUp")}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">{tCommon("type")}</Label>
                          <Select value={followUpType} onValueChange={setFollowUpType}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder={t("selectType")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="call">{t("activityTypes.call")}</SelectItem>
                              <SelectItem value="email">{t("activityTypes.email")}</SelectItem>
                              <SelectItem value="meeting">{t("activityTypes.meeting")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">{t("date")}</Label>
                          <Input
                            type="date"
                            className="h-8 text-xs"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder={t("followUpNotes")}
                        className="text-xs min-h-[60px]"
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                      />
                      <Button size="sm" className="w-full text-xs">
                        {t("scheduleActivity")}
                      </Button>
                    </div>

                    <Separator />

                    <ActivityTimeline
                      activities={activities || []}
                      loading={activitiesLoading}
                    />
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="space-y-4">
                    <Textarea
                      defaultValue={lead.notes}
                      placeholder={t("addNotes")}
                      className="min-h-[150px]"
                    />
                    <Button size="sm">{tCommon("save")}</Button>
                  </TabsContent>
                </Tabs>

                {/* Quick Actions Footer */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`tel:${lead.contact.phone}`}>
                      <Phone className="h-4 w-4 me-1" />
                      {t("activityTypes.call")}
                    </a>
                  </Button>
                  {lead.contact.email && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`mailto:${lead.contact.email}`}>
                        <Mail className="h-4 w-4 me-1" />
                        {t("activityTypes.email")}
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a
                      href={`https://wa.me/${lead.contact.phone.replace(/\+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 me-1" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
