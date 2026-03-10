"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TenantProfile } from "@/lib/types";

interface GeneralSettingsProps {
  tenant: TenantProfile;
}

export function GeneralSettings({ tenant }: GeneralSettingsProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      name: tenant.name,
      nameAr: tenant.nameAr,
      vatNumber: tenant.vatNumber,
      crNumber: tenant.crNumber,
      street: tenant.address.street,
      streetAr: tenant.address.streetAr,
      city: tenant.address.city,
      district: tenant.address.district,
      postalCode: tenant.address.postalCode,
      phone: tenant.contact.phone,
      email: tenant.contact.email,
      website: tenant.contact.website || "",
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    // Will be connected to API
    console.log("Save profile:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("general.companyProfile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-lg">
              <AvatarFallback className="rounded-lg text-lg">
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 me-2" />
                {t("general.changeLogo")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {t("general.logoHint")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Company Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("general.nameEn")}</Label>
              <Input id="name" {...register("name")} />
            </div>
            <div>
              <Label htmlFor="nameAr">{t("general.nameAr")}</Label>
              <Input id="nameAr" {...register("nameAr")} dir="rtl" />
            </div>
          </div>

          {/* Tax / CR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vatNumber">{t("general.vatNumber")}</Label>
              <Input id="vatNumber" {...register("vatNumber")} dir="ltr" />
            </div>
            <div>
              <Label htmlFor="crNumber">{t("general.crNumber")}</Label>
              <Input id="crNumber" {...register("crNumber")} dir="ltr" />
            </div>
          </div>

          <Separator />

          {/* Address */}
          <h3 className="text-sm font-semibold">{t("general.address")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">{t("general.street")} (EN)</Label>
              <Input id="street" {...register("street")} />
            </div>
            <div>
              <Label htmlFor="streetAr">{t("general.street")} (AR)</Label>
              <Input id="streetAr" {...register("streetAr")} dir="rtl" />
            </div>
            <div>
              <Label htmlFor="city">{t("general.city")}</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="district">{t("general.district")}</Label>
              <Input id="district" {...register("district")} />
            </div>
            <div>
              <Label htmlFor="postalCode">{t("general.postalCode")}</Label>
              <Input id="postalCode" {...register("postalCode")} dir="ltr" />
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <h3 className="text-sm font-semibold">{t("general.contactInfo")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t("general.phone")}</Label>
              <Input id="phone" {...register("phone")} dir="ltr" />
            </div>
            <div>
              <Label htmlFor="email">{t("general.email")}</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="website">{t("general.website")}</Label>
              <Input id="website" {...register("website")} dir="ltr" placeholder="https://" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" disabled={!isDirty}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={!isDirty}>
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
