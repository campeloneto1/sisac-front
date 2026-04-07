"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractTypesService } from "@/services/contract-types/service";
import type { ContractTypeFilters } from "@/types/contract-type.type";

export function useContractTypes(filters: ContractTypeFilters) {
  return useQuery({
    queryKey: ["contract-types", filters],
    queryFn: () => contractTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useContractType(id: number | string) {
  return useQuery({
    queryKey: ["contract-types", id],
    queryFn: () => contractTypesService.show(id),
    enabled: Boolean(id),
  });
}
