"use client";

import { useTranslations, useLocale } from "next-intl";
import { Shield, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TenantRole } from "@/lib/types";

const actionLabels: Record<string, string> = {
  view: "settings.roles.view",
  create: "settings.roles.create",
  edit: "settings.roles.edit",
  delete: "settings.roles.delete",
  export: "settings.roles.export",
};

interface RolesSettingsProps {
  roles: TenantRole[];
}

export function RolesSettings({ roles }: RolesSettingsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      {roles.map((role) => (
        <Card key={role.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <CardTitle className="text-base">
                  {isAr ? role.nameAr : role.name}
                </CardTitle>
                {role.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    {t("settings.roles.system")}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {role.usersCount} {t("settings.roles.users")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">{t("settings.roles.module")}</TableHead>
                    {Object.keys(actionLabels).map((action) => (
                      <TableHead key={action} className="text-center w-20">
                        {t(actionLabels[action])}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.permissions.map((perm) => (
                    <TableRow key={perm.module}>
                      <TableCell className="font-medium text-sm">
                        {isAr ? perm.moduleAr : perm.module}
                      </TableCell>
                      {(Object.keys(perm.actions) as Array<keyof typeof perm.actions>).map(
                        (action) => (
                          <TableCell key={action} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm.actions[action]}
                                disabled={role.isSystem}
                                aria-label={`${perm.module}: ${action} permission`}
                              />
                            </div>
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
