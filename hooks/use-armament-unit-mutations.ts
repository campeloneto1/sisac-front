"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { armamentUnitsService } from "@/services/armament-units/service";

function invalidateArmamentUnitQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  armamentId: number | string,
  unitId?: number | string,
) {
  queryClient.invalidateQueries({ queryKey: ["armament-units", armamentId] });
  queryClient.invalidateQueries({
    queryKey: ["armament-reports", "armament-panel", armamentId],
  });

  if (unitId !== undefined) {
    queryClient.invalidateQueries({
      queryKey: ["armament-units", armamentId, unitId],
    });
  }
}

export function useCreateArmamentUnitMutation(armamentId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof armamentUnitsService.create>[1]) =>
      armamentUnitsService.create(armamentId, payload),
    onSuccess(response) {
      invalidateArmamentUnitQueries(queryClient, armamentId, response.data.id);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateArmamentUnitMutation(armamentId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      payload,
    }: {
      unitId: number | string;
      payload: Parameters<typeof armamentUnitsService.update>[2];
    }) => armamentUnitsService.update(armamentId, unitId, payload),
    onSuccess(response, variables) {
      invalidateArmamentUnitQueries(queryClient, armamentId, variables.unitId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteArmamentUnitMutation(armamentId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: number | string) =>
      armamentUnitsService.remove(armamentId, unitId),
    onSuccess(response) {
      invalidateArmamentUnitQueries(queryClient, armamentId);
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
