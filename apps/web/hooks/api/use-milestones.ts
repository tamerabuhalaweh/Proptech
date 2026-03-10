"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { milestonesApi } from "@/lib/api";
import { mockMilestones } from "@/lib/mock-milestones";
import type { Milestone } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useMilestones(bookingId: string) {
  return useQuery({
    queryKey: ["milestones", bookingId],
    queryFn: () =>
      withFallback(
        () => milestonesApi.list(bookingId),
        {
          data: mockMilestones.filter((m) => m.bookingId === bookingId || bookingId === "booking_1"),
          pagination: { page: 1, perPage: 50, total: mockMilestones.length, totalPages: 1 },
        }
      ),
    enabled: !!bookingId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, ...payload }: Record<string, unknown> & { bookingId: string }) =>
      milestonesApi.create(bookingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      milestoneId,
      ...payload
    }: Record<string, unknown> & { bookingId: string; milestoneId: string }) =>
      milestonesApi.recordPayment(bookingId, milestoneId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

export function useGenerateInstallments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      totalAmount,
      numberOfInstallments,
      startDate,
    }: {
      bookingId: string;
      totalAmount: number;
      numberOfInstallments: number;
      startDate: string;
    }) =>
      milestonesApi.generateInstallments(bookingId, { totalAmount, numberOfInstallments, startDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}
