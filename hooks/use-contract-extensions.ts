"use client";

import { useQuery } from "@tanstack/react-query";

import { contractExtensionsService } from "@/services/contract-extensions/service";
import type { ContractExtensionFilters } from "@/types/contract-extension.type";

export function useContractExtensions(contractId: number | string, filters: ContractExtensionFilters, enabled = true) {
  return useQuery({
    queryKey: ["contracts", contractId, "extensions", filters],
    queryFn: () => contractExtensionsService.index(contractId, filters),
    enabled: Boolean(contractId) && enabled,
  });
}
