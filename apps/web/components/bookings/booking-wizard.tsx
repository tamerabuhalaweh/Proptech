"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Building2,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stepper } from "@/components/common/stepper";
import { StatusBadge } from "@/components/common/status-badge";
import { CurrencyDisplay } from "@/components/common/currency-display";
import { useInventoryUnits } from "@/hooks/api/use-inventory";
import { useLeads } from "@/hooks/api/use-leads";
import type { Unit, Lead } from "@/lib/types";

// ===== Schemas =====

const clientSchema = z.object({
  existingLeadId: z.string().optional(),
  name: z.string().min(2),
  nameAr: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  nationalId: z.string().optional(),
});

const paymentSchema = z.object({
  totalPrice: z.coerce.number().min(1),
  downPayment: z.coerce.number().min(0),
  installmentCount: z.coerce.number().min(1).max(60),
});

type ClientForm = z.infer<typeof clientSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

interface BookingWizardProps {
  preselectedUnitId?: string;
  onComplete: (data: {
    unitId: string;
    client: ClientForm;
    payment: PaymentForm;
  }) => void;
  onCancel: () => void;
}

export function BookingWizard({ preselectedUnitId, onComplete, onCancel }: BookingWizardProps) {
  const t = useTranslations("bookings.wizard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [step, setStep] = useState(preselectedUnitId ? 1 : 0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [clientData, setClientData] = useState<ClientForm | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentForm | null>(null);

  const steps = [
    { label: t("step1") },
    { label: t("step2") },
    { label: t("step3") },
    { label: t("step4") },
  ];

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setStep(1);
  };

  const handleClientSubmit = (data: ClientForm) => {
    setClientData(data);
    setStep(2);
  };

  const handlePaymentSubmit = (data: PaymentForm) => {
    setPaymentData(data);
    setStep(3);
  };

  const handleConfirm = () => {
    if (selectedUnit && clientData && paymentData) {
      onComplete({
        unitId: selectedUnit.id,
        client: clientData,
        payment: paymentData,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />

      <div className="min-h-[400px]">
        {step === 0 && (
          <UnitSelectionStep
            onSelect={handleSelectUnit}
            selectedUnit={selectedUnit}
          />
        )}
        {step === 1 && (
          <ClientInfoStep
            initialData={clientData}
            onSubmit={handleClientSubmit}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <PaymentPlanStep
            unitPrice={selectedUnit?.pricing?.annualRent || 0}
            initialData={paymentData}
            onSubmit={handlePaymentSubmit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <ReviewStep
            unit={selectedUnit!}
            client={clientData!}
            payment={paymentData!}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

// ===== Step 1: Select Unit =====

function UnitSelectionStep({
  onSelect,
  selectedUnit,
}: {
  onSelect: (unit: Unit) => void;
  selectedUnit: Unit | null;
}) {
  const t = useTranslations("bookings.wizard");
  const tStatus = useTranslations("unitStatus");
  const tType = useTranslations("unitType");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("available");

  const { data, isLoading } = useInventoryUnits({
    search: search || undefined,
    status: statusFilter ? [statusFilter] : undefined,
    perPage: 20,
  });

  const units = (data?.data || []) as Unit[];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchUnits")}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{tStatus("available")}</SelectItem>
            <SelectItem value="reserved">{tStatus("reserved")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 max-h-[350px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))
        ) : units.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noUnitsFound")}
          </p>
        ) : (
          units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => onSelect(unit)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border text-start transition-colors hover:bg-accent",
                selectedUnit?.id === unit.id && "ring-2 ring-primary bg-accent"
              )}
            >
              <div>
                <p className="text-sm font-medium">
                  {t("unitLabel", { number: unit.number })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tType(unit.type)} • {unit.area} m² • F{unit.floor}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unit.pricing && (
                  <CurrencyDisplay
                    amount={unit.pricing.annualRent}
                    compact
                    className="text-sm"
                  />
                )}
                <StatusBadge status={unit.status} size="sm" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ===== Step 2: Client Info =====

function ClientInfoStep({
  initialData,
  onSubmit,
  onBack,
}: {
  initialData: ClientForm | null;
  onSubmit: (data: ClientForm) => void;
  onBack: () => void;
}) {
  const t = useTranslations("bookings.wizard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [mode, setMode] = useState<"existing" | "new">(
    initialData?.existingLeadId ? "existing" : "new"
  );
  const [leadSearch, setLeadSearch] = useState("");

  const { data: leadsData } = useLeads({
    search: leadSearch || undefined,
    perPage: 10,
  });
  const leads = (leadsData?.data || []) as Lead[];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      name: "",
      nameAr: "",
      phone: "",
      email: "",
      nationalId: "",
    },
  });

  const selectLead = (lead: Lead) => {
    setValue("existingLeadId", lead.id);
    setValue("name", lead.contact.name);
    setValue("nameAr", lead.contact.nameAr);
    setValue("phone", lead.contact.phone);
    setValue("email", lead.contact.email || "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "existing" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("existing")}
        >
          {t("existingLead")}
        </Button>
        <Button
          type="button"
          variant={mode === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("new")}
        >
          {t("newClient")}
        </Button>
      </div>

      {mode === "existing" && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder={t("searchLeads")}
              className="ps-9"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => selectLead(lead)}
                className={cn(
                  "flex items-center justify-between w-full p-2 rounded-md text-start text-sm hover:bg-accent",
                  watch("existingLeadId") === lead.id && "bg-accent ring-1 ring-primary"
                )}
              >
                <div>
                  <p className="font-medium">{locale === "ar" ? lead.contact.nameAr : lead.contact.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.contact.phone}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {lead.scoreLabel}
                </Badge>
              </button>
            ))}
          </div>
          <Separator />
        </div>
      )}

      <div className="grid gap-3">
        <div>
          <Label>{t("clientName")} *</Label>
          <Input
            {...register("name")}
            placeholder={t("clientNamePlaceholder")}
            className={errors.name ? "border-destructive" : ""}
          />
        </div>
        <div>
          <Label>{t("clientNameAr")}</Label>
          <Input {...register("nameAr")} placeholder={t("clientNameArPlaceholder")} dir="rtl" />
        </div>
        <div>
          <Label>{t("clientPhone")} *</Label>
          <Input
            {...register("phone")}
            placeholder="+966 5x xxx xxxx"
            dir="ltr"
            className={errors.phone ? "border-destructive" : ""}
          />
        </div>
        <div>
          <Label>{t("clientEmail")}</Label>
          <Input {...register("email")} type="email" placeholder="email@example.com" />
        </div>
        <div>
          <Label>{t("nationalId")}</Label>
          <Input {...register("nationalId")} placeholder={t("nationalIdPlaceholder")} dir="ltr" />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 me-1 rtl:rotate-180" />
          {tCommon("back")}
        </Button>
        <Button type="submit" className="flex-1">
          {tCommon("next")}
          <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
        </Button>
      </div>
    </form>
  );
}

// ===== Step 3: Payment Plan =====

function PaymentPlanStep({
  unitPrice,
  initialData,
  onSubmit,
  onBack,
}: {
  unitPrice: number;
  initialData: PaymentForm | null;
  onSubmit: (data: PaymentForm) => void;
  onBack: () => void;
}) {
  const t = useTranslations("bookings.wizard");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      totalPrice: unitPrice || 0,
      downPayment: Math.round(unitPrice * 0.2),
      installmentCount: 12,
    },
  });

  const totalPrice = watch("totalPrice");
  const downPayment = watch("downPayment");
  const installmentCount = watch("installmentCount");

  const remaining = totalPrice - downPayment;
  const installmentAmount = installmentCount > 0 ? Math.round(remaining / installmentCount) : 0;
  const downPaymentPct = totalPrice > 0 ? Math.round((downPayment / totalPrice) * 100) : 0;

  // Generate preview schedule
  const schedule = useMemo(() => {
    if (installmentCount <= 0 || remaining <= 0) return [];
    const items = [];
    const now = new Date();
    for (let i = 1; i <= Math.min(installmentCount, 6); i++) {
      const due = new Date(now);
      due.setMonth(due.getMonth() + i);
      items.push({
        number: i,
        amount: i === installmentCount ? remaining - installmentAmount * (installmentCount - 1) : installmentAmount,
        dueDate: due.toISOString(),
      });
    }
    return items;
  }, [installmentCount, remaining, installmentAmount]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label>{t("totalPrice")} *</Label>
          <Input
            type="number"
            {...register("totalPrice")}
            dir="ltr"
            className={errors.totalPrice ? "border-destructive" : ""}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>{t("downPayment")} *</Label>
            <span className="text-xs text-muted-foreground">{downPaymentPct}%</span>
          </div>
          <Input
            type="number"
            {...register("downPayment")}
            dir="ltr"
            className={errors.downPayment ? "border-destructive" : ""}
          />
        </div>

        <div>
          <Label>{t("installments")} *</Label>
          <Select
            value={String(installmentCount)}
            onValueChange={(v) => setValue("installmentCount", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3, 6, 12, 18, 24, 36, 48, 60].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {t("months")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("remaining")}</span>
            <CurrencyDisplay amount={remaining} className="font-medium" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("monthlyPayment")}</span>
            <CurrencyDisplay amount={installmentAmount} className="font-semibold" />
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      {schedule.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">{t("schedulePreview")}</h4>
          <div className="space-y-1">
            {schedule.map((s) => (
              <div key={s.number} className="flex justify-between text-xs text-muted-foreground">
                <span>#{s.number} — {new Date(s.dueDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-SA")}</span>
                <CurrencyDisplay amount={s.amount} className="text-xs" />
              </div>
            ))}
            {installmentCount > 6 && (
              <p className="text-xs text-muted-foreground text-center">
                ... +{installmentCount - 6} {t("moreInstallments")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 me-1 rtl:rotate-180" />
          {tCommon("back")}
        </Button>
        <Button type="submit" className="flex-1">
          {tCommon("next")}
          <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
        </Button>
      </div>
    </form>
  );
}

// ===== Step 4: Review & Confirm =====

function ReviewStep({
  unit,
  client,
  payment,
  onConfirm,
  onBack,
}: {
  unit: Unit;
  client: ClientForm;
  payment: PaymentForm;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("bookings.wizard");
  const tCommon = useTranslations("common");
  const tType = useTranslations("unitType");
  const locale = useLocale();

  const remaining = payment.totalPrice - payment.downPayment;
  const installmentAmount =
    payment.installmentCount > 0
      ? Math.round(remaining / payment.installmentCount)
      : 0;

  return (
    <div className="space-y-4">
      {/* Unit Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">{t("step1")}</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("unitLabel", { number: "" })}</span>
              <span className="font-medium">{unit.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCommon("type")}</span>
              <span>{tType(unit.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCommon("area")}</span>
              <span>{unit.area} m²</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">{t("step2")}</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tCommon("name")}</span>
              <span className="font-medium">{client.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("clientPhone")}</span>
              <span dir="ltr">{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("clientEmail")}</span>
                <span>{client.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">{t("step3")}</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("totalPrice")}</span>
              <CurrencyDisplay amount={payment.totalPrice} className="font-semibold" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("downPayment")}</span>
              <CurrencyDisplay amount={payment.downPayment} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("installments")}</span>
              <span>{payment.installmentCount}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("monthlyPayment")}</span>
              <CurrencyDisplay amount={installmentAmount} className="font-medium" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 me-1 rtl:rotate-180" />
          {tCommon("back")}
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          <CheckCircle className="h-4 w-4 me-1" />
          {t("confirmBooking")}
        </Button>
      </div>
    </div>
  );
}
