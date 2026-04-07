"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractFeaturesService } from "@/services/contract-features/service";
import type { ContractFeatureFilters } from "@/types/contract-feature.type";

export function useContractFeatures(filters: ContractFeatureFilters) {
  return useQuery({
    queryKey: ["contract-features", filters],
    queryFn: () => contractFeaturesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useContractFeature(id: number | string) {
  return useQuery({
    queryKey: ["contract-features", id],
    queryFn: () => contractFeaturesService.show(id),
    enabled: Boolean(id),
  });
}
