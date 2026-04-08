"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceTypesService } from "@/services/service-types/service";
import type { ServiceTypeFilters } from "@/types/service-type.type";

export function useServiceTypes(filters: ServiceTypeFilters) {
  return useQuery({
    queryKey: ["service-types", filters],
    queryFn: () => serviceTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useServiceType(id: number | string) {
  return useQuery({
    queryKey: ["service-types", id],
    queryFn: () => serviceTypesService.show(id),
    enabled: Boolean(id),
  });
}
