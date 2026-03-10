"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import {
  mockLeads,
  leadToCardData,
  mockPipelineSummary,
  mockLeadActivities,
  LEAD_STAGES,
} from "@/lib/mock-leads";
import type {
  Lead,
  LeadCardData,
  PipelineSummary,
  LeadActivity,
  LeadStage,
} from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useLeads(params?: {
  stage?: string[];
  score?: string;
  source?: string[];
  agentId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () =>
      withFallback(
        () => leadsApi.list(params),
        {
          data: filterMockLeads(mockLeads, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 50,
            total: mockLeads.length,
            totalPages: Math.ceil(mockLeads.length / (params?.perPage || 50)),
          },
        }
      ),
  });
}

function filterMockLeads(
  leads: Lead[],
  params?: {
    stage?: string[];
    score?: string;
    source?: string[];
    agentId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }
): Lead[] {
  let filtered = [...leads];

  if (params?.stage?.length) {
    filtered = filtered.filter((l) => params.stage!.includes(l.stage));
  }
  if (params?.source?.length) {
    filtered = filtered.filter((l) => params.source!.includes(l.source));
  }
  if (params?.agentId) {
    filtered = filtered.filter((l) => l.agent.id === params.agentId);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.contact.name.toLowerCase().includes(s) ||
        l.contact.nameAr.includes(s) ||
        l.contact.email?.toLowerCase().includes(s) ||
        l.contact.phone.includes(s)
    );
  }
  if (params?.score) {
    filtered = filtered.filter((l) => l.scoreLabel === params.score);
  }

  if (params?.sortBy) {
    const order = params.sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      switch (params.sortBy) {
        case "score":
          return (a.score - b.score) * order;
        case "name":
          return a.contact.name.localeCompare(b.contact.name) * order;
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        default:
          return 0;
      }
    });
  }

  const page = params?.page || 1;
  const perPage = params?.perPage || 50;
  const start = (page - 1) * perPage;
  return filtered.slice(start, start + perPage);
}

export function useLeadsByStage() {
  return useQuery({
    queryKey: ["leads", "by-stage"],
    queryFn: () =>
      withFallback<Record<LeadStage, LeadCardData[]>>(
        async () => {
          const { data } = await leadsApi.list({ perPage: 200 });
          return groupLeadsByStage(data as Lead[]);
        },
        groupLeadsByStage(mockLeads)
      ),
  });
}

function groupLeadsByStage(leads: Lead[]): Record<LeadStage, LeadCardData[]> {
  const grouped: Record<LeadStage, LeadCardData[]> = {
    new: [],
    contacted: [],
    qualified: [],
    viewing: [],
    negotiation: [],
    won: [],
    lost: [],
  };
  for (const lead of leads) {
    grouped[lead.stage].push(leadToCardData(lead));
  }
  return grouped;
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () =>
      withFallback<Lead>(
        () => leadsApi.get(id),
        mockLeads.find((l) => l.id === id) || mockLeads[0]
      ),
    enabled: !!id,
  });
}

export function useLeadActivities(id: string) {
  return useQuery({
    queryKey: ["lead", id, "activities"],
    queryFn: () =>
      withFallback<LeadActivity[]>(
        () => leadsApi.getActivities(id),
        mockLeadActivities
      ),
    enabled: !!id,
  });
}

export function usePipelineStats() {
  return useQuery({
    queryKey: ["leads", "pipeline-stats"],
    queryFn: () =>
      withFallback<PipelineSummary>(
        () => leadsApi.pipelineStats(),
        mockPipelineSummary
      ),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => leadsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      leadsApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", variables.id] });
    },
  });
}

export function useChangeLeadStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage, note }: { id: string; stage: string; note?: string }) =>
      leadsApi.changeStage(id, stage, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string }) =>
      leadsApi.assign(id, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
