"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { materialBatchesService } from "@/services/material-batches/service";
import type { CreateMaterialBatchDTO, UpdateMaterialBatchDTO } from "@/types/material-batch.type";

function invalidateMaterialBatchQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  materialId?: number | string,
  batchId?: number | string,
) {
  queryClient.invalidateQueries({ queryKey: ["material-batches"] });
  queryClient.invalidateQueries({ queryKey: ["materials"] });

  if (materialId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["materials", String(materialId)],
    });
  }

  if (batchId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["material-batches", batchId],
    });
  }
}

export function useCreateMaterialBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMaterialBatchDTO) =>
      materialBatchesService.create(payload),
    onSuccess(response) {
      invalidateMaterialBatchQueries(
        queryClient,
        response.data.material_id,
        response.data.id,
      );
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateMaterialBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      payload,
    }: {
      batchId: number | string;
      payload: UpdateMaterialBatchDTO;
    }) => materialBatchesService.update(batchId, payload),
    onSuccess(response, variables) {
      invalidateMaterialBatchQueries(
        queryClient,
        response.data.material_id,
        variables.batchId,
      );
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMaterialBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      materialId,
    }: {
      batchId: number | string;
      materialId?: number | string;
    }) => materialBatchesService.remove(batchId),
    onSuccess(response, variables) {
      invalidateMaterialBatchQueries(queryClient, variables.materialId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
