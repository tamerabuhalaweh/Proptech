"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Check,
  Star,
  Building2,
  Users,
  HardDrive,
  ArrowRight,
  ArrowDown,
  Home,
  Download,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { DateDisplay } from "@/components/common/date-display";
import {
  useCurrentSubscription,
  useBillingHistory,
  useUpgradeSubscription,
  useDowngradeSubscription,
} from "@/hooks/api/use-subscriptions";
import { SUBSCRIPTION_PLANS, mockBillingHistory } from "@/lib/mock-subscriptions";
import type { TenantSubscription, SubscriptionPlan, BillingHistoryItem } from "@/lib/types";
import { toast } from "sonner";

export function SubscriptionSettings() {
  const t = useTranslations("settings.subscription");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: subscription, isLoading } = useCurrentSubscription();
  const { data: billingHistory } = useBillingHistory();
  const upgradeMutation = useUpgradeSubscription();
  const downgradeMutation = useDowngradeSubscription();

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [actionType, setActionType] = useState<"upgrade" | "downgrade">("upgrade");

  if (isLoading || !subscription) {
    return <SubscriptionSkeleton />;
  }

  const currentPlanIndex = SUBSCRIPTION_PLANS.findIndex(
    (p) => p.key === subscription.plan
  );

  const handlePlanAction = (plan: SubscriptionPlan) => {
    const planIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.key === plan.key);
    setSelectedPlan(plan);
    setActionType(planIndex > currentPlanIndex ? "upgrade" : "downgrade");
    setUpgradeDialogOpen(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;
    try {
      if (actionType === "upgrade") {
        await upgradeMutation.mutateAsync(selectedPlan.key);
      } else {
        await downgradeMutation.mutateAsync(selectedPlan.key);
      }
      toast.success(t(`${actionType}Success`));
    } catch {
      toast.error(t(`${actionType}Error`));
    }
    setUpgradeDialogOpen(false);
  };

  const usageItems = [
    {
      label: t("properties"),
      icon: Building2,
      used: subscription.usage.properties.used,
      limit: subscription.usage.properties.limit,
    },
    {
      label: t("units"),
      icon: Home,
      used: Math.round(subscription.usage.properties.used * 8.5),
      limit: SUBSCRIPTION_PLANS.find((p) => p.key === subscription.plan)?.units || 500,
    },
    {
      label: t("users"),
      icon: Users,
      used: subscription.usage.users.used,
      limit: subscription.usage.users.limit,
    },
    {
      label: t("storage"),
      icon: HardDrive,
      used: subscription.usage.storage.usedGB,
      limit: subscription.usage.storage.limitGB,
      unit: "GB",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan + Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("currentPlan")}</CardTitle>
            <Badge>
              <Star className="h-3 w-3 me-1" />
              {t(`plans.${subscription.plan}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("nextBilling")}</span>
            <span>
              <DateDisplay date={subscription.currentPeriodEnd} /> •{" "}
              <CurrencyDisplay
                amount={subscription.monthlyPrice}
                className="font-medium"
              />
              /{t("month")}
            </span>
          </div>

          {/* Usage meters */}
          <div className="space-y-4 pt-2">
            {usageItems.map((item) => {
              const pct = item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0;
              const color =
                pct < 60
                  ? "bg-green-500"
                  : pct < 80
                    ? "bg-amber-500"
                    : "bg-red-500";
              const textColor =
                pct < 60
                  ? "text-green-600"
                  : pct < 80
                    ? "text-amber-600"
                    : "text-red-600";
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.used}
                      {item.unit ? ` ${item.unit}` : ""} / {item.limit}
                      {item.unit ? ` ${item.unit}` : ""}
                      <span className={cn("ms-2 text-xs font-medium", textColor)}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", color)}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h3 className="text-sm font-semibold mb-4">{t("comparePlans")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.key === subscription.plan;
            const planIndex = SUBSCRIPTION_PLANS.findIndex((p) => p.key === plan.key);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;

            return (
              <Card
                key={plan.key}
                className={cn(
                  "relative",
                  isCurrent && "ring-2 ring-primary"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-3 start-4">
                    <Badge className="text-xs">
                      <Star className="h-3 w-3 me-1" />
                      {t("current")}
                    </Badge>
                  </div>
                )}
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold">
                      {t(`plans.${plan.key}`)}
                    </h4>
                    <div className="mt-1">
                      <CurrencyDisplay
                        amount={plan.price}
                        className="text-2xl font-bold"
                      />
                      <span className="text-sm text-muted-foreground">
                        /{t("month")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.properties === -1
                          ? t("unlimited")
                          : `${plan.properties} ${t("properties")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.units === -1
                          ? t("unlimited")
                          : `${plan.units} ${t("units")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {plan.users === -1
                          ? t("unlimited")
                          : `${plan.users} ${t("users")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.storageGB} GB</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>{t(`features.${f}`)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        {t("current")}
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        className="w-full"
                        onClick={() => handlePlanAction(plan)}
                      >
                        {t("upgrade")}
                        <ArrowRight className="h-4 w-4 ms-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handlePlanAction(plan)}
                      >
                        {t("downgrade")}
                        <ArrowDown className="h-4 w-4 ms-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div>
        <h3 className="text-sm font-semibold mb-4">{t("featureMatrix")}</h3>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("feature")}</TableHead>
                {SUBSCRIPTION_PLANS.map((p) => (
                  <TableHead key={p.key} className="text-center">
                    {t(`plans.${p.key}`)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_FEATURES.map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="text-sm">{t(`features.${feature}`)}</TableCell>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <TableCell key={plan.key} className="text-center">
                      {plan.features.includes(feature) ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-sm font-semibold mb-4">{t("billingHistory")}</h3>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("billingDate")}</TableHead>
                <TableHead>{tCommon("description")}</TableHead>
                <TableHead className="text-end">{t("billingAmount")}</TableHead>
                <TableHead>{tCommon("status")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(billingHistory || mockBillingHistory).map((item: BillingHistoryItem) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <DateDisplay date={item.date} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {isAr ? item.descriptionAr : item.description}
                  </TableCell>
                  <TableCell className="text-end">
                    <CurrencyDisplay amount={item.amount} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        item.status === "paid" && "text-green-600 border-green-200",
                        item.status === "pending" && "text-amber-600 border-amber-200",
                        item.status === "failed" && "text-red-600 border-red-200"
                      )}
                    >
                      {t(`billingStatus.${item.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.invoiceUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "upgrade" ? t("confirmUpgrade") : t("confirmDowngrade")}
            </DialogTitle>
            <DialogDescription>
              {actionType === "upgrade"
                ? t("upgradeDescription")
                : t("downgradeDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">{t("from")}:</span>
                  <span className="ms-2 font-medium">
                    {t(`plans.${subscription.plan}`)}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t("to")}:</span>
                  <span className="ms-2 font-medium">
                    {t(`plans.${selectedPlan.key}`)}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("newPrice")}:</span>
                <CurrencyDisplay
                  amount={selectedPlan.price}
                  className="font-semibold"
                />
                <span className="text-muted-foreground">/{t("month")}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={confirmPlanChange}
              variant={actionType === "downgrade" ? "outline" : "default"}
              disabled={upgradeMutation.isPending || downgradeMutation.isPending}
            >
              {tCommon("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// All features across all plans for comparison matrix
const ALL_FEATURES = [
  "basic_analytics",
  "email_support",
  "inventory_management",
  "lead_management",
  "advanced_analytics",
  "priority_support",
  "api_access",
  "custom_roles",
  "campaign_pricing",
  "duplicate_detection",
  "bulk_operations",
  "dedicated_support",
  "sla",
  "custom_integrations",
  "white_label",
  "hijri_calendar",
  "advanced_reporting",
  "audit_log",
];

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
