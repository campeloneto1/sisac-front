"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceStatusHistoriesService } from "@/services/service-status-histories/service";
import type { ServiceStatusHistoryFilters } from "@/types/service-status-history.type";

export function useServiceStatusHistories(
  filters: ServiceStatusHistoryFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["service-status-history", filters],
    queryFn: () => serviceStatusHistoriesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useServiceStatusHistory(
  id: number | string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["service-status-history", id],
    queryFn: () => serviceStatusHistoriesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
