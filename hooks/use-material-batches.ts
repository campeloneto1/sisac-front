"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { materialBatchesService } from "@/services/material-batches/service";
import type { MaterialBatchFilters } from "@/types/material-batch.type";

export function useMaterialBatches(
  filters: MaterialBatchFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["material-batches", filters],
    queryFn: () => materialBatchesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMaterialBatch(batchId: number | string, enabled = true) {
  return useQuery({
    queryKey: ["material-batches", batchId],
    queryFn: () => materialBatchesService.show(batchId),
    enabled: Boolean(batchId) && enabled,
  });
}
