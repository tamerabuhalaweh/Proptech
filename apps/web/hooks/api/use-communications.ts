"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationsApi, emailTemplatesApi } from "@/lib/api";
import { mockCommunications, mockEmailTemplates } from "@/lib/mock-communications";
import type { Communication, EmailTemplate } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useCommunications(params?: {
  type?: string[];
  direction?: string;
  status?: string[];
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["communications", params],
    queryFn: () =>
      withFallback(
        () => communicationsApi.list(params),
        {
          data: filterMockCommunications(mockCommunications, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 20,
            total: mockCommunications.length,
            totalPages: 1,
          },
        }
      ),
  });
}

function filterMockCommunications(
  comms: Communication[],
  params?: {
    type?: string[];
    direction?: string;
    status?: string[];
    search?: string;
  }
): Communication[] {
  let filtered = [...comms];
  if (params?.type?.length) {
    filtered = filtered.filter((c) => params.type!.includes(c.type));
  }
  if (params?.direction) {
    filtered = filtered.filter((c) => c.direction === params.direction);
  }
  if (params?.status?.length) {
    filtered = filtered.filter((c) => params.status!.includes(c.status));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.contact.name.toLowerCase().includes(s) ||
        c.contact.nameAr.includes(s) ||
        c.subject.toLowerCase().includes(s)
    );
  }
  return filtered;
}

export function useCommunication(id: string) {
  return useQuery({
    queryKey: ["communication", id],
    queryFn: () =>
      withFallback<Communication>(
        () => communicationsApi.get(id),
        mockCommunications.find((c) => c.id === id) || mockCommunications[0]
      ),
    enabled: !!id,
  });
}

export function useCreateCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => communicationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications"] });
    },
  });
}

// Email Templates hooks
export function useEmailTemplates(params?: {
  category?: string[];
  search?: string;
}) {
  return useQuery({
    queryKey: ["email-templates", params],
    queryFn: () =>
      withFallback(
        () => emailTemplatesApi.list(params),
        {
          data: filterMockTemplates(mockEmailTemplates, params),
          pagination: { page: 1, perPage: 20, total: mockEmailTemplates.length, totalPages: 1 },
        }
      ),
  });
}

function filterMockTemplates(
  templates: EmailTemplate[],
  params?: { category?: string[]; search?: string }
): EmailTemplate[] {
  let filtered = [...templates];
  if (params?.category?.length) {
    filtered = filtered.filter((t) => params.category!.includes(t.category));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.nameAr.includes(s) ||
        t.subject.toLowerCase().includes(s)
    );
  }
  return filtered;
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => emailTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Record<string, unknown> & { id: string }) =>
      emailTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: ({ templateId, ...payload }: { templateId: string; recipientEmail: string; leadId?: string; variables?: Record<string, string> }) =>
      emailTemplatesApi.send(templateId, payload),
  });
}
