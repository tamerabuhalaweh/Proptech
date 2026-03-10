"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api";
import { mockBookings } from "@/lib/mock-bookings";
import type { Booking } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useBookings(params?: {
  status?: string[];
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () =>
      withFallback(
        () => bookingsApi.list(params),
        {
          data: filterMockBookings(mockBookings, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 20,
            total: mockBookings.length,
            totalPages: 1,
          },
        }
      ),
  });
}

function filterMockBookings(
  bookings: Booking[],
  params?: {
    status?: string[];
    search?: string;
    page?: number;
    perPage?: number;
  }
): Booking[] {
  let filtered = [...bookings];
  if (params?.status?.length) {
    filtered = filtered.filter((b) => params.status!.includes(b.status));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.client.name.toLowerCase().includes(s) ||
        b.client.nameAr.includes(s) ||
        b.unitNumber.toLowerCase().includes(s)
    );
  }
  return filtered;
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () =>
      withFallback<Booking>(
        () => bookingsApi.get(id),
        mockBookings.find((b) => b.id === id) || mockBookings[0]
      ),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => bookingsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}
