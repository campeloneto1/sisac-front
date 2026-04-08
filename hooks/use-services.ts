"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { servicesService } from "@/services/services/service";
import type { ServiceFilters } from "@/types/service.type";

export function useServices(filters: ServiceFilters, enabled = true) {
  return useQuery({
    queryKey: ["services", filters],
    queryFn: () => servicesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useService(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => servicesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
