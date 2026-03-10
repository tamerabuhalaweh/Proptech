"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DuplicateWarningModal } from "./duplicate-warning-modal";
import { MergeLeadsDialog } from "./merge-leads-dialog";
import { leadDuplicatesApi } from "@/lib/api";
import type { DuplicateLead } from "@/lib/types";

const createLeadSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().min(1),
  interestType: z.string().min(1),
  propertyType: z.string().min(1),
  city: z.string().min(1),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
});

type CreateLeadForm = z.infer<typeof createLeadSchema>;

interface CreateLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeadForm) => void;
}

// Mock duplicates for when API is not yet available
const mockDuplicates: DuplicateLead[] = [
  {
    id: "lead_dup_1",
    name: "Ahmed Al-Qahtani",
    nameAr: "أحمد القحطاني",
    email: "ahmed@email.com",
    phone: "+966501234567",
    stage: "contacted",
    score: 85,
    scoreLabel: "hot",
    confidence: 92,
    lastActivityAt: "2026-03-10T08:00:00Z",
  },
  {
    id: "lead_dup_2",
    name: "Ahmad Qahtani",
    nameAr: "أحمد قحطاني",
    phone: "+966501234568",
    stage: "new",
    score: 45,
    scoreLabel: "warm",
    confidence: 65,
    lastActivityAt: "2026-03-05T12:00:00Z",
  },
];

export function CreateLeadSheet({ open, onOpenChange, onSubmit }: CreateLeadSheetProps) {
  const t = useTranslations("leads");
  const tCommon = useTranslations("common");

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateLead[]>([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedMergeDuplicate, setSelectedMergeDuplicate] = useState<DuplicateLead | null>(null);
  const [pendingFormData, setPendingFormData] = useState<CreateLeadForm | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadForm>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      source: "",
      interestType: "",
      propertyType: "",
      city: "",
      timeline: "",
    },
  });

  const handleFormSubmit = async (data: CreateLeadForm) => {
    setPendingFormData(data);

    // Check for duplicates before creating
    try {
      const result = await leadDuplicatesApi.checkDuplicates({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
      });
      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
        setDuplicateModalOpen(true);
        return;
      }
    } catch {
      // API not available — use mock detection for demo
      // Simple name-match check for demo purposes
      const nameWords = data.name.toLowerCase().split(" ");
      const mockMatches = mockDuplicates.filter((d) => {
        const dupWords = d.name.toLowerCase().split(" ");
        return nameWords.some((w) => dupWords.some((dw) => dw.includes(w) || w.includes(dw)));
      });
      if (mockMatches.length > 0) {
        setDuplicates(mockMatches);
        setDuplicateModalOpen(true);
        return;
      }
    }

    // No duplicates found — create directly
    finishCreate(data);
  };

  const finishCreate = (data: CreateLeadForm) => {
    onSubmit(data);
    reset();
    setDuplicateModalOpen(false);
    setMergeDialogOpen(false);
    setPendingFormData(null);
    onOpenChange(false);
  };

  const handleCreateAnyway = () => {
    if (pendingFormData) {
      finishCreate(pendingFormData);
    }
  };

  const handleViewExisting = (id: string) => {
    setDuplicateModalOpen(false);
    onOpenChange(false);
    // In a real app, navigate to lead detail
  };

  const handleMerge = (duplicate: DuplicateLead) => {
    setSelectedMergeDuplicate(duplicate);
    setDuplicateModalOpen(false);
    setMergeDialogOpen(true);
  };

  const handleConfirmMerge = async (fields: Record<string, "target" | "source">) => {
    if (selectedMergeDuplicate && pendingFormData) {
      try {
        await leadDuplicatesApi.mergeLeads(
          selectedMergeDuplicate.id,
          "new",
          fields as unknown as Record<string, string>
        );
      } catch {
        // Mock merge — just close
      }
      setMergeDialogOpen(false);
      setPendingFormData(null);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <ScrollArea className="h-full">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              <SheetHeader>
                <SheetTitle>{t("createLead")}</SheetTitle>
                <SheetDescription>{t("createLeadDescription")}</SheetDescription>
              </SheetHeader>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{t("contactInfo")}</h3>

                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="name">{t("form.name")} *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder={t("form.namePlaceholder")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{t("form.nameRequired")}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nameAr">{t("form.nameAr")}</Label>
                    <Input
                      id="nameAr"
                      {...register("nameAr")}
                      placeholder={t("form.nameArPlaceholder")}
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("form.phone")} *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+966 5x xxx xxxx"
                      dir="ltr"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder={t("form.emailPlaceholder")}
                    />
                  </div>

                  <div>
                    <Label>{t("form.source")} *</Label>
                    <Select
                      value={watch("source")}
                      onValueChange={(v) => setValue("source", v)}
                    >
                      <SelectTrigger className={errors.source ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("form.selectSource")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">{t("sources.website")}</SelectItem>
                        <SelectItem value="walk_in">{t("sources.walk_in")}</SelectItem>
                        <SelectItem value="referral">{t("sources.referral")}</SelectItem>
                        <SelectItem value="social_media">{t("sources.social_media")}</SelectItem>
                        <SelectItem value="phone">{t("sources.phone")}</SelectItem>
                        <SelectItem value="partner">{t("sources.partner")}</SelectItem>
                        <SelectItem value="other">{t("sources.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Interest */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{t("interest")}</h3>

                <div className="grid gap-3">
                  <div>
                    <Label>{t("form.interestType")} *</Label>
                    <Select
                      value={watch("interestType")}
                      onValueChange={(v) => setValue("interestType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectInterestType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">{t("interestTypes.buy")}</SelectItem>
                        <SelectItem value="rent">{t("interestTypes.rent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("form.propertyType")} *</Label>
                    <Select
                      value={watch("propertyType")}
                      onValueChange={(v) => setValue("propertyType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectPropertyType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">{t("propertyTypes.apartment")}</SelectItem>
                        <SelectItem value="villa">{t("propertyTypes.villa")}</SelectItem>
                        <SelectItem value="office">{t("propertyTypes.office")}</SelectItem>
                        <SelectItem value="land">{t("propertyTypes.land")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("form.city")} *</Label>
                    <Select
                      value={watch("city")}
                      onValueChange={(v) => setValue("city", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectCity")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="riyadh">{t("cities.riyadh")}</SelectItem>
                        <SelectItem value="jeddah">{t("cities.jeddah")}</SelectItem>
                        <SelectItem value="dammam">{t("cities.dammam")}</SelectItem>
                        <SelectItem value="makkah">{t("cities.makkah")}</SelectItem>
                        <SelectItem value="madinah">{t("cities.madinah")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="budgetMin">{t("form.budgetMin")}</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        {...register("budgetMin")}
                        placeholder="SAR"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">{t("form.budgetMax")}</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        {...register("budgetMax")}
                        placeholder="SAR"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="bedrooms">{t("form.bedrooms")}</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        {...register("bedrooms")}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>{t("form.timeline")}</Label>
                      <Select
                        value={watch("timeline")}
                        onValueChange={(v) => setValue("timeline", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.selectTimeline")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">{t("timelines.immediate")}</SelectItem>
                          <SelectItem value="1-3months">{t("timelines.1-3months")}</SelectItem>
                          <SelectItem value="3-6months">{t("timelines.3-6months")}</SelectItem>
                          <SelectItem value="6plus">{t("timelines.6plus")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <Label htmlFor="notes">{t("notesTab")}</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder={t("form.notesPlaceholder")}
                  className="min-h-[80px]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? t("creating") : t("createLead")}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        open={duplicateModalOpen}
        onOpenChange={setDuplicateModalOpen}
        duplicates={duplicates}
        onCreateAnyway={handleCreateAnyway}
        onViewExisting={handleViewExisting}
        onMerge={handleMerge}
      />

      {/* Merge Dialog */}
      {selectedMergeDuplicate && pendingFormData && (
        <MergeLeadsDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          targetLead={{
            name: pendingFormData.name,
            nameAr: pendingFormData.nameAr || "",
            phone: pendingFormData.phone,
            email: pendingFormData.email,
          }}
          sourceLead={selectedMergeDuplicate}
          onConfirmMerge={handleConfirmMerge}
        />
      )}
    </>
  );
}
