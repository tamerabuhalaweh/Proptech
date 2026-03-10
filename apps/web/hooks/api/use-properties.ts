"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi, buildingsApi } from "@/lib/api";
import {
  mockProperties,
  mockPropertyDetail,
  mockBuildings,
} from "@/lib/mock-properties";
import type { PropertySummary, PropertyDetail, Building } from "@/lib/types";

// Check if API is reachable, fallback to mock data
async function withFallback<T>(apiFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

export function useProperties(params?: {
  search?: string;
  type?: string[];
  status?: string[];
  city?: string[];
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () =>
      withFallback(
        () => propertiesApi.list(params),
        {
          data: filterMockProperties(mockProperties, params),
          pagination: {
            page: params?.page || 1,
            perPage: params?.perPage || 12,
            total: mockProperties.length,
            totalPages: Math.ceil(
              mockProperties.length / (params?.perPage || 12)
            ),
          },
        }
      ),
  });
}

function filterMockProperties(
  properties: PropertySummary[],
  params?: {
    search?: string;
    type?: string[];
    status?: string[];
    city?: string[];
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): PropertySummary[] {
  let filtered = [...properties];

  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.nameAr.includes(s) ||
        p.address.city.toLowerCase().includes(s) ||
        p.address.cityAr.includes(s)
    );
  }

  if (params?.type?.length) {
    filtered = filtered.filter((p) => params.type!.includes(p.type));
  }

  if (params?.status?.length) {
    filtered = filtered.filter((p) => params.status!.includes(p.status));
  }

  if (params?.city?.length) {
    filtered = filtered.filter(
      (p) =>
        params.city!.includes(p.address.city) ||
        params.city!.includes(p.address.cityAr)
    );
  }

  if (params?.sortBy) {
    const order = params.sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      switch (params.sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * order;
        case "occupancy":
          return (a.stats.occupancyRate - b.stats.occupancyRate) * order;
        case "units":
          return (a.stats.totalUnits - b.stats.totalUnits) * order;
        case "revenue":
          return (a.stats.revenueMTD - b.stats.revenueMTD) * order;
        default:
          return 0;
      }
    });
  }

  // Pagination
  const page = params?.page || 1;
  const perPage = params?.perPage || 12;
  const start = (page - 1) * perPage;
  return filtered.slice(start, start + perPage);
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () =>
      withFallback<PropertyDetail>(
        () => propertiesApi.get(id),
        id === "prop_1"
          ? mockPropertyDetail
          : {
              ...mockProperties.find((p) => p.id === id)!,
              description: "",
              descriptionAr: "",
              details: {},
              amenities: [],
              stats: {
                ...mockProperties.find((p) => p.id === id)!.stats,
                availableUnits: 10,
                reservedUnits: 5,
                occupiedUnits: mockProperties.find((p) => p.id === id)!.stats.occupiedUnits,
                blockedUnits: 3,
              },
              buildings: [],
              images: [],
            }
      ),
    enabled: !!id,
  });
}

export function usePropertyBuildings(propertyId: string) {
  return useQuery({
    queryKey: ["property", propertyId, "buildings"],
    queryFn: () =>
      withFallback<Building[]>(
        () => buildingsApi.list(propertyId),
        propertyId === "prop_1" ? mockBuildings : []
      ),
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      nameAr?: string;
      description?: string;
      type: string;
      location?: string;
      city?: string;
      coverImageUrl?: string;
    }) => propertiesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      propertiesApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
