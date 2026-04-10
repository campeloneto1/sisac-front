"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { armamentBatchesService } from "@/services/armament-batches/service";
import type { CreateArmamentBatchDTO, UpdateArmamentBatchDTO } from "@/types/armament-batch.type";

function invalidateArmamentBatchQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  armamentId?: number | string,
  batchId?: number | string,
) {
  queryClient.invalidateQueries({ queryKey: ["armament-batches"] });

  if (armamentId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["armament-reports", "armament-panel", armamentId],
    });
  }

  if (batchId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["armament-batches", batchId],
    });
  }
}

export function useCreateArmamentBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArmamentBatchDTO) =>
      armamentBatchesService.create(payload),
    onSuccess(response) {
      invalidateArmamentBatchQueries(
        queryClient,
        response.data.armament_id,
        response.data.id,
      );
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateArmamentBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      payload,
    }: {
      batchId: number | string;
      payload: UpdateArmamentBatchDTO;
    }) => armamentBatchesService.update(batchId, payload),
    onSuccess(response, variables) {
      invalidateArmamentBatchQueries(
        queryClient,
        response.data.armament_id,
        variables.batchId,
      );
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteArmamentBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      armamentId,
    }: {
      batchId: number | string;
      armamentId?: number | string;
    }) => armamentBatchesService.remove(batchId),
    onSuccess(response, variables) {
      invalidateArmamentBatchQueries(queryClient, variables.armamentId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
