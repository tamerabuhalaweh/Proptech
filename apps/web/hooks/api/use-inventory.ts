"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitsApi } from "@/lib/api";
import {
  mockBuildings,
  buildingsToGrid,
  getAllUnits,
  getUnitStatusCounts,
} from "@/lib/mock-properties";
import type { Unit, BuildingGrid, UnitStatus } from "@/lib/types";

async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useInventoryUnits(params?: {
  propertyId?: string;
  buildingId?: string;
  status?: string[];
  type?: string[];
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["inventory", "units", params],
    queryFn: () =>
      withFallback(
        () => unitsApi.listAll(params),
        {
          data: filterMockUnits(getAllUnits(), params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 50,
            total: getAllUnits().length,
            totalPages: Math.ceil(getAllUnits().length / (params?.perPage || 50)),
          },
        }
      ),
  });
}

function filterMockUnits(
  units: Unit[],
  params?: {
    buildingId?: string;
    status?: string[];
    type?: string[];
    search?: string;
    page?: number;
    perPage?: number;
  }
): Unit[] {
  let filtered = [...units];

  if (params?.buildingId) {
    filtered = filtered.filter((u) => u.buildingId === params.buildingId);
  }
  if (params?.status?.length) {
    filtered = filtered.filter((u) => params.status!.includes(u.status));
  }
  if (params?.type?.length) {
    filtered = filtered.filter((u) => params.type!.includes(u.type));
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.number.toLowerCase().includes(s) ||
        u.type.toLowerCase().includes(s)
    );
  }

  const page = params?.page || 1;
  const perPage = params?.perPage || 50;
  const start = (page - 1) * perPage;
  return filtered.slice(start, start + perPage);
}

export function useInventoryGrid(buildingId?: string) {
  return useQuery({
    queryKey: ["inventory", "grid", buildingId],
    queryFn: () => {
      const buildings = buildingId
        ? mockBuildings.filter((b) => b.id === buildingId)
        : mockBuildings;
      return buildingsToGrid(buildings);
    },
  });
}

export function useInventorySummary(buildingId?: string) {
  return useQuery({
    queryKey: ["inventory", "summary", buildingId],
    queryFn: () => {
      let units = getAllUnits();
      if (buildingId) {
        units = units.filter((u) => u.buildingId === buildingId);
      }
      return {
        total: units.length,
        ...getUnitStatusCounts(units),
      };
    },
  });
}

export function useUnitDetail(unitId: string) {
  return useQuery({
    queryKey: ["unit", unitId],
    queryFn: () =>
      withFallback<Unit | undefined>(
        () => unitsApi.get(unitId),
        getAllUnits().find((u) => u.id === unitId)
      ),
    enabled: !!unitId,
  });
}

export function useChangeUnitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      status,
      note,
    }: {
      unitId: string;
      status: UnitStatus;
      note?: string;
    }) => unitsApi.changeStatus(unitId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["unit"] });
    },
  });
}

export function useBulkChangeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      unitIds,
      status,
      note,
    }: {
      unitIds: string[];
      status: UnitStatus;
      note?: string;
    }) => {
      // Bulk update — one by one for now since API may not have bulk endpoint
      const results = await Promise.allSettled(
        unitIds.map((id) => unitsApi.changeStatus(id, status, note))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["unit"] });
    },
  });
}
