"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleRentalsService } from "@/services/vehicle-rentals/service";

export function useCreateVehicleRentalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleRentalsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleRentalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleRentalsService.update>[1];
    }) => vehicleRentalsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-rentals"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-rentals", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleRentalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleRentalsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
