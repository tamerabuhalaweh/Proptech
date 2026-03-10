"use client";

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

const createCampaignSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

interface CreateCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCampaignForm) => void;
}

export function CreateCampaignSheet({ open, onOpenChange, onSubmit }: CreateCampaignSheetProps) {
  const t = useTranslations("campaigns");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      discountType: "percentage",
    },
  });

  const discountType = watch("discountType");

  const handleFormSubmit = (data: CreateCampaignForm) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle>{t("createCampaign")}</SheetTitle>
              <SheetDescription>{t("createDescription")}</SheetDescription>
            </SheetHeader>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label>{t("form.name")} *</Label>
                <Input
                  {...register("name")}
                  placeholder={t("form.namePlaceholder")}
                  className={errors.name ? "border-destructive" : ""}
                />
              </div>
              <div>
                <Label>{t("form.nameAr")}</Label>
                <Input
                  {...register("nameAr")}
                  placeholder={t("form.nameArPlaceholder")}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>{tCommon("description")}</Label>
                <Textarea
                  {...register("description")}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </div>
            </div>

            <Separator />

            {/* Discount */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("form.discount")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("form.discountType")} *</Label>
                  <Select
                    value={discountType}
                    onValueChange={(v) => setValue("discountType", v as "percentage" | "fixed")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t("form.percentage")}</SelectItem>
                      <SelectItem value="fixed">{t("form.fixedAmount")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("form.discountValue")} *</Label>
                  <Input
                    type="number"
                    {...register("discountValue")}
                    placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 50000"}
                    dir="ltr"
                    className={errors.discountValue ? "border-destructive" : ""}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("form.dates")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("form.startDate")} *</Label>
                  <Input
                    type="date"
                    {...register("startDate")}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <Label>{t("form.endDate")} *</Label>
                  <Input
                    type="date"
                    {...register("endDate")}
                    className={errors.endDate ? "border-destructive" : ""}
                  />
                </div>
              </div>
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
                {t("createCampaign")}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
