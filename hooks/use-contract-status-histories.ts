"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractStatusHistoriesService } from "@/services/contract-status-histories/service";
import type { ContractStatusHistoryFilters } from "@/types/contract-status-history.type";

export function useContractStatusHistories(filters: ContractStatusHistoryFilters, enabled = true) {
  return useQuery({
    queryKey: ["contract-status-histories", filters],
    queryFn: () => contractStatusHistoriesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}
