"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractObjectsService } from "@/services/contract-objects/service";
import type { ContractObjectFilters } from "@/types/contract-object.type";

export function useContractObjects(filters: ContractObjectFilters) {
  return useQuery({
    queryKey: ["contract-objects", filters],
    queryFn: () => contractObjectsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useContractObject(id: number | string) {
  return useQuery({
    queryKey: ["contract-objects", id],
    queryFn: () => contractObjectsService.show(id),
    enabled: Boolean(id),
  });
}
