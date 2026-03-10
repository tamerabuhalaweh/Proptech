"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NotificationPreference } from "@/lib/types";

interface NotificationsSettingsProps {
  preferences: NotificationPreference[];
}

export function NotificationsSettings({ preferences: initialPrefs }: NotificationsSettingsProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [prefs, setPrefs] = useState(initialPrefs);

  const togglePref = (index: number, channel: "inApp" | "email" | "sms") => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [channel]: !p[channel] } : p))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("notifications.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("notifications.category")}</TableHead>
                <TableHead className="text-center w-24">{t("notifications.inApp")}</TableHead>
                <TableHead className="text-center w-24">{t("notifications.email")}</TableHead>
                <TableHead className="text-center w-24">{t("notifications.sms")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prefs.map((pref, i) => (
                <TableRow key={pref.category}>
                  <TableCell className="text-sm font-medium">
                    {isAr ? pref.categoryAr : pref.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.inApp}
                        onCheckedChange={() => togglePref(i, "inApp")}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.email}
                        onCheckedChange={() => togglePref(i, "email")}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch
                        checked={pref.sms}
                        onCheckedChange={() => togglePref(i, "sms")}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline">{tCommon("cancel")}</Button>
          <Button>{tCommon("save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
