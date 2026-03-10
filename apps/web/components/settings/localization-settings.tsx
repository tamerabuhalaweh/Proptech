"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocaleSettings } from "@/hooks/use-locale-settings";
import type { LocaleSettings } from "@/lib/types";
import { toast } from "sonner";

export function LocalizationSettings() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { settings, isLoading, updateSettings } = useLocaleSettings();

  const [formValues, setFormValues] = useState<LocaleSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof LocaleSettings, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSettings(formValues);
      toast.success(t("localization.saveSuccess"));
    } catch {
      toast.error(t("localization.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("localization.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>{t("localization.language")}</Label>
            <Select
              value={formValues.defaultLocale}
              onValueChange={(v) => handleChange("defaultLocale", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.calendar")}</Label>
            <Select
              value={formValues.primaryCalendar}
              onValueChange={(v) => handleChange("primaryCalendar", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hijri">{t("localization.hijri")}</SelectItem>
                <SelectItem value="gregorian">{t("localization.gregorian")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.dateFormat")}</Label>
            <Select
              value={formValues.dateFormat}
              onValueChange={(v) => handleChange("dateFormat", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hijri">{t("localization.hijriOnly")}</SelectItem>
                <SelectItem value="gregorian">{t("localization.gregorianOnly")}</SelectItem>
                <SelectItem value="both">{t("localization.both")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.timeFormat")}</Label>
            <Select
              value={formValues.timeFormat}
              onValueChange={(v) => handleChange("timeFormat", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12h (AM/PM)</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.currency")}</Label>
            <Select
              value={formValues.currency || "SAR"}
              onValueChange={(v) => handleChange("currency", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">SAR - {t("localization.sar")}</SelectItem>
                <SelectItem value="AED">AED - {t("localization.aed")}</SelectItem>
                <SelectItem value="USD">USD - {t("localization.usd")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.timezone")}</Label>
            <Select
              value={formValues.timezone}
              onValueChange={(v) => handleChange("timezone", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                <SelectItem value="Africa/Cairo">Africa/Cairo (GMT+2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.firstDay")}</Label>
            <Select
              value={formValues.firstDayOfWeek}
              onValueChange={(v) => handleChange("firstDayOfWeek", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">{t("localization.sunday")}</SelectItem>
                <SelectItem value="saturday">{t("localization.saturday")}</SelectItem>
                <SelectItem value="monday">{t("localization.monday")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("localization.numberFormat")}</Label>
            <Select
              value={formValues.numberFormat}
              onValueChange={(v) => handleChange("numberFormat", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="western">1,234.56 (Western)</SelectItem>
                <SelectItem value="arabic-indic">١٬٢٣٤٫٥٦ (Arabic-Indic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline">{tCommon("cancel")}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 me-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 me-1" />
            )}
            {tCommon("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
