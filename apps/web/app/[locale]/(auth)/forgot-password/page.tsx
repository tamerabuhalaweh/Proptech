"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const errT = useTranslations("auth.errors");
  const locale = useLocale();

  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(errT("emailRequired"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(errT("emailInvalid"));
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        {/* Success State */}
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10">
          <Mail className="h-8 w-8 text-success" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("checkEmail")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("checkEmailDescription", { email })}
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
        >
          {t("resend")}
        </Button>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo on mobile */}
      <div className="lg:hidden text-center mb-8">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
          P
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2 text-center lg:text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            className="h-11"
            autoComplete="email"
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            t("sendLink")
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
