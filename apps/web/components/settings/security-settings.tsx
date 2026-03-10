"use client";

import { useTranslations, useLocale } from "next-intl";
import { Shield, Monitor, Smartphone, Globe, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ActiveSession } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface SecuritySettingsProps {
  sessions: ActiveSession[];
}

export function SecuritySettings({ sessions }: SecuritySettingsProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("security.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword">{t("security.currentPassword")}</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">{t("security.newPassword")}</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t("security.confirmPassword")}</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>{t("security.updatePassword")}</Button>
        </CardContent>
      </Card>

      {/* Two-Factor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("security.twoFactor")}</CardTitle>
            <Switch />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("security.twoFactorDescription")}
          </p>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("security.activeSessions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = session.device.toLowerCase().includes("iphone") ||
              session.device.toLowerCase().includes("android")
                ? Smartphone
                : Monitor;

            return (
              <div
                key={session.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  session.current && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          {t("security.currentSession")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.browser}</span>
                      <span>•</span>
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(session.lastActiveAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-destructive text-xs">
                    <LogOut className="h-3 w-3 me-1" />
                    {t("security.revoke")}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
