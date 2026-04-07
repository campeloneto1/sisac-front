"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleMaintenancesService } from "@/services/vehicle-maintenances/service";

export function useCreateVehicleMaintenanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleMaintenancesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleMaintenanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleMaintenancesService.update>[1];
    }) => vehicleMaintenancesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-maintenances", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleMaintenanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleMaintenancesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
