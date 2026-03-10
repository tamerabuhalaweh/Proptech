"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api";
import {
  mockCurrentSubscription,
  mockBillingHistory,
} from "@/lib/mock-subscriptions";
import type { TenantSubscription, BillingHistoryItem } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () =>
      withFallback<TenantSubscription>(
        () => subscriptionsApi.getCurrent(),
        mockCurrentSubscription
      ),
  });
}

export function useSubscriptionUsage() {
  return useQuery({
    queryKey: ["subscription", "usage"],
    queryFn: () =>
      withFallback(
        () => subscriptionsApi.getUsage(),
        mockCurrentSubscription.usage
      ),
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ["subscription", "billing-history"],
    queryFn: () =>
      withFallback<BillingHistoryItem[]>(
        async () => {
          // Backend doesn't have this endpoint yet; use mock
          throw new Error("Not implemented");
        },
        mockBillingHistory
      ),
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planKey: string) => subscriptionsApi.upgrade(planKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export function useDowngradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planKey: string) => subscriptionsApi.downgrade(planKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}
