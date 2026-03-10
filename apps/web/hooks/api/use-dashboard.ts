"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";
import {
  mockDashboardKPIs,
  mockActivities,
  mockTopProperties,
  mockRevenueData,
  mockUnitStatusData,
} from "@/lib/mock-data";
import type { DashboardStats, DashboardActivity, TopProperty } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () =>
      withFallback<DashboardStats>(
        () => dashboardApi.stats(),
        mockDashboardKPIs
      ),
    staleTime: 60 * 1000,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () =>
      withFallback<DashboardActivity[]>(
        () => dashboardApi.activity(),
        mockActivities
      ),
    staleTime: 30 * 1000,
  });
}

export function useTopProperties() {
  return useQuery({
    queryKey: ["dashboard", "top-properties"],
    queryFn: () =>
      withFallback<TopProperty[]>(
        () => dashboardApi.topProperties(),
        mockTopProperties
      ),
    staleTime: 60 * 1000,
  });
}

export function useRevenueData() {
  return useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () =>
      withFallback(
        async () => {
          const stats = await dashboardApi.stats();
          return stats.revenueData || mockRevenueData;
        },
        mockRevenueData
      ),
    staleTime: 60 * 1000,
  });
}

export function useUnitStatusData() {
  return useQuery({
    queryKey: ["dashboard", "unit-status"],
    queryFn: () =>
      withFallback(
        async () => {
          const stats = await dashboardApi.stats();
          return stats.unitStatusData || mockUnitStatusData;
        },
        mockUnitStatusData
      ),
    staleTime: 60 * 1000,
  });
}
