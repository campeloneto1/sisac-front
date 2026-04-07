"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleLoansService } from "@/services/vehicle-loans/service";

export function useCreateVehicleLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleLoansService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleLoansService.update>[1];
    }) => vehicleLoansService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleLoansService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useMarkVehicleLoanReturnedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleLoansService.markAsReturned>[1];
    }) => vehicleLoansService.markAsReturned(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-loans", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", response.data.vehicle_id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
