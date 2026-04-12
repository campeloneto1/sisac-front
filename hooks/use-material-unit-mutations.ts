"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { materialUnitsService } from "@/services/material-units/service";

function invalidateMaterialUnitQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  materialId: number | string,
  unitId?: number | string,
) {
  queryClient.invalidateQueries({ queryKey: ["material-units", materialId] });
  queryClient.invalidateQueries({ queryKey: ["materials", String(materialId)] });

  if (unitId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["material-units", materialId, unitId],
    });
  }
}

export function useCreateMaterialUnitMutation(materialId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof materialUnitsService.create>[1]) =>
      materialUnitsService.create(materialId, payload),
    onSuccess(response) {
      invalidateMaterialUnitQueries(queryClient, materialId, response.data.id);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateMaterialUnitMutation(materialId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: number | string;
      payload: Parameters<typeof materialUnitsService.update>[2];
    }) => materialUnitsService.update(materialId, unitId, payload),
    onSuccess(response, variables) {
      invalidateMaterialUnitQueries(queryClient, materialId, variables.unitId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMaterialUnitMutation(materialId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: number | string) =>
      materialUnitsService.remove(materialId, unitId),
    onSuccess(response) {
      invalidateMaterialUnitQueries(queryClient, materialId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
