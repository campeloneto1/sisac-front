"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleDamagesService } from "@/services/vehicle-damages/service";

export function useCreateVehicleDamageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleDamagesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-damages"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleDamageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleDamagesService.update>[1];
    }) => vehicleDamagesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-damages"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-damages", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleDamageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleDamagesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-damages"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
