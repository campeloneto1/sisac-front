"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractAlertsService } from "@/services/contract-alerts/service";
import type { ContractAlertFilters } from "@/types/contract-alert.type";

export function useContractAlerts(filters: ContractAlertFilters, enabled = true) {
  return useQuery({
    queryKey: ["contract-alerts", filters],
    queryFn: () => contractAlertsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}
