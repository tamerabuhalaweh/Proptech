import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  locale: string = "en-SA",
  compact: boolean = false
): string {
  if (compact) {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "SAR",
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return formatter.format(amount);
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

export function formatNumber(
  num: number,
  locale: string = "en-SA"
): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatPercentage(
  value: number,
  locale: string = "en-SA"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function getGreeting(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
