"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";
import { mockDocuments } from "@/lib/mock-documents";
import type { Document } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useDocuments(params?: {
  category?: string[];
  entityType?: string[];
  search?: string;
  isArchived?: boolean;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () =>
      withFallback(
        () => documentsApi.list(params),
        {
          data: filterMockDocuments(mockDocuments, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 20,
            total: mockDocuments.length,
            totalPages: 1,
          },
        }
      ),
  });
}

function filterMockDocuments(
  docs: Document[],
  params?: {
    category?: string[];
    entityType?: string[];
    search?: string;
    isArchived?: boolean;
  }
): Document[] {
  let filtered = [...docs];
  if (params?.isArchived !== undefined) {
    filtered = filtered.filter((d) => d.isArchived === params.isArchived);
  }
  if (params?.category?.length) {
    filtered = filtered.filter((d) => params.category!.includes(d.category));
  }
  if (params?.entityType?.length) {
    filtered = filtered.filter((d) => d.entityType && params.entityType!.includes(d.entityType));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        (d.nameAr && d.nameAr.includes(s)) ||
        d.tags.some((t) => t.toLowerCase().includes(s))
    );
  }
  return filtered;
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () =>
      withFallback<Document>(
        () => documentsApi.get(id),
        mockDocuments.find((d) => d.id === id) || mockDocuments[0]
      ),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => documentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUnarchiveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
