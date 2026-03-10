"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";
import { GeneralSettings } from "@/components/settings/general-settings";
import { UsersSettings } from "@/components/settings/users-settings";
import { RolesSettings } from "@/components/settings/roles-settings";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";
import { LocalizationSettings } from "@/components/settings/localization-settings";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  mockTenantProfile,
  mockUsers,
  mockRoles,
  mockNotificationPreferences,
  mockActiveSessions,
} from "@/lib/mock-settings";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [activeSection, setActiveSection] = useState("general");
  const { isMobile } = useBreakpoint();

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings tenant={mockTenantProfile} />;
      case "users":
        return <UsersSettings users={mockUsers} />;
      case "roles":
        return <RolesSettings roles={mockRoles} />;
      case "subscription":
        return <SubscriptionSettings />;
      case "localization":
        return <LocalizationSettings />;
      case "notifications":
        return <NotificationsSettings preferences={mockNotificationPreferences} />;
      case "security":
        return <SecuritySettings sessions={mockActiveSessions} />;
      default:
        return <GeneralSettings tenant={mockTenantProfile} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
