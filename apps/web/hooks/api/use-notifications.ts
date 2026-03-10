"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { mockAppNotifications } from "@/lib/mock-notifications";
import type { AppNotification } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useNotifications(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () =>
      withFallback(
        () => notificationsApi.list(params),
        {
          data: mockAppNotifications,
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 20,
            total: mockAppNotifications.length,
            totalPages: 1,
          },
        }
      ),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      withFallback(
        () => notificationsApi.unreadCount(),
        { count: mockAppNotifications.filter((n) => !n.read).length }
      ),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
