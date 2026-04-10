"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentBatchesService } from "@/services/armament-batches/service";
import type { ArmamentBatchFilters } from "@/types/armament-batch.type";

export function useArmamentBatches(
  filters: ArmamentBatchFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["armament-batches", filters],
    queryFn: () => armamentBatchesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useArmamentBatch(batchId: number | string, enabled = true) {
  return useQuery({
    queryKey: ["armament-batches", batchId],
    queryFn: () => armamentBatchesService.show(batchId),
    enabled: Boolean(batchId) && enabled,
  });
}
