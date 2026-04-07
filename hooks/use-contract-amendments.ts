"use client";

import { useQuery } from "@tanstack/react-query";

import { contractAmendmentsService } from "@/services/contract-amendments/service";
import type { ContractAmendmentFilters } from "@/types/contract-amendment.type";

export function useContractAmendments(contractId: number | string, filters: ContractAmendmentFilters, enabled = true) {
  return useQuery({
    queryKey: ["contracts", contractId, "amendments", filters],
    queryFn: () => contractAmendmentsService.index(contractId, filters),
    enabled: Boolean(contractId) && enabled,
  });
}
