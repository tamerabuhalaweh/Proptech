"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const errT = useTranslations("auth.errors");
  const locale = useLocale();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = errT("nameRequired");
    if (!formData.email) newErrors.email = errT("emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = errT("emailInvalid");
    if (!formData.company) newErrors.company = errT("companyRequired");
    if (!formData.password) newErrors.password = errT("passwordRequired");
    else if (formData.password.length < 8)
      newErrors.password = errT("passwordMin");
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = errT("passwordMatch");
    if (!formData.agreeTerms) newErrors.agreeTerms = errT("agreeRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input
            id="fullName"
            type="text"
            placeholder={t("fullNamePlaceholder")}
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            dir="auto"
            className="h-11"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            dir="ltr"
            className="h-11"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">{t("company")}</Label>
          <Input
            id="company"
            type="text"
            placeholder={t("companyPlaceholder")}
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            dir="auto"
            className="h-11"
            aria-invalid={!!errors.company}
          />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              dir="ltr"
              className="h-11 pe-10"
              aria-invalid={!!errors.password}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute end-0 top-0 h-11 w-11 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("passwordRequirements")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            dir="ltr"
            className="h-11"
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, agreeTerms: checked as boolean })
            }
            className="mt-0.5"
          />
          <Label
            htmlFor="agreeTerms"
            className="text-sm font-normal leading-relaxed cursor-pointer"
          >
            {locale === "ar" ? (
              <>
                أوافق على{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  شروط الخدمة
                </a>{" "}
                و{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  سياسة الخصوصية
                </a>
              </>
            ) : (
              <>
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
              </>
            )}
          </Label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-destructive">{errors.agreeTerms}</p>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("signingUp")}
            </>
          ) : (
            t("signUp")
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
