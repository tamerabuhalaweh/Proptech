"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProperty } from "@/hooks/api/use-properties";

const createPropertySchema = z.object({
  name: z.string().min(2, "Name is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["residential", "commercial", "mixed", "land"]),
  location: z.string().optional(),
  city: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

type CreatePropertyForm = z.infer<typeof createPropertySchema>;

// We need a Select UI component — check if it exists
// For now, create a simple one using Radix
function SelectUI() {}

interface CreatePropertySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePropertySheet({
  open,
  onOpenChange,
}: CreatePropertySheetProps) {
  const t = useTranslations("properties.create");
  const typeT = useTranslations("propertyType");
  const createMutation = useCreateProperty();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyForm>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      type: "residential",
      location: "",
      city: "",
      coverImageUrl: "",
    },
  });

  const onSubmit = async (data: CreatePropertyForm) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(t("success"));
      reset();
      onOpenChange(false);
    } catch {
      toast.error(t("error"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")} *</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Name Arabic */}
          <div className="space-y-2">
            <Label htmlFor="nameAr">{t("nameAr")}</Label>
            <Input
              id="nameAr"
              placeholder={t("nameArPlaceholder")}
              dir="rtl"
              {...register("nameAr")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")}</Label>
            <Input
              id="description"
              placeholder={t("descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t("type")} *</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={watch("type")}
              onChange={(e) => setValue("type", e.target.value as CreatePropertyForm["type"])}
            >
              <option value="residential">{typeT("residential")}</option>
              <option value="commercial">{typeT("commercial")}</option>
              <option value="mixed">{typeT("mixed")}</option>
              <option value="land">{typeT("land")}</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t("location")}</Label>
            <Input
              id="location"
              placeholder={t("locationPlaceholder")}
              {...register("location")}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input
              id="city"
              placeholder={t("cityPlaceholder")}
              {...register("city")}
            />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">{t("coverImage")}</Label>
            <Input
              id="coverImageUrl"
              placeholder={t("coverImagePlaceholder")}
              {...register("coverImageUrl")}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {useTranslations("common")("cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t("creating") : t("submit")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
