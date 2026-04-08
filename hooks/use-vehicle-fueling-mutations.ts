"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleFuelingsService } from "@/services/vehicle-fuelings/service";

export function useCreateVehicleFuelingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleFuelingsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-fuelings"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-reports"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-operations"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleFuelingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleFuelingsService.update>[1];
    }) => vehicleFuelingsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-fuelings"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-fuelings", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-reports"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-operations"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleFuelingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleFuelingsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-fuelings"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-reports"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-operations"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
