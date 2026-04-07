"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleTypesService } from "@/services/vehicle-types/service";

export function useCreateVehicleTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleTypesService.update>[1];
    }) => vehicleTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-types", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
