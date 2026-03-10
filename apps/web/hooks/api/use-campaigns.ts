"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api";
import { mockCampaigns, mockCampaignUnits } from "@/lib/mock-campaigns";
import type { Campaign, CampaignUnit } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useCampaigns(params?: {
  status?: string[];
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () =>
      withFallback(
        () => campaignsApi.list(params),
        {
          data: filterMockCampaigns(mockCampaigns, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 20,
            total: mockCampaigns.length,
            totalPages: 1,
          },
        }
      ),
  });
}

function filterMockCampaigns(
  campaigns: Campaign[],
  params?: { status?: string[]; search?: string }
): Campaign[] {
  let filtered = [...campaigns];
  if (params?.status?.length) {
    filtered = filtered.filter((c) => params.status!.includes(c.status));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.nameAr.includes(s)
    );
  }
  return filtered;
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () =>
      withFallback<Campaign>(
        () => campaignsApi.get(id),
        mockCampaigns.find((c) => c.id === id) || mockCampaigns[0]
      ),
    enabled: !!id,
  });
}

export function useCampaignUnits(campaignId: string) {
  return useQuery({
    queryKey: ["campaign", campaignId, "units"],
    queryFn: () => mockCampaignUnits,
    enabled: !!campaignId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => campaignsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      campaignsApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", variables.id] });
    },
  });
}
