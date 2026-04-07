"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { vehicleCustodiesService } from "@/services/vehicle-custodies/service";

export function useCreateVehicleCustodyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleCustodiesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateVehicleCustodyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleCustodiesService.update>[1];
    }) => vehicleCustodiesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-custodies", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteVehicleCustodyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleCustodiesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useFinalizeVehicleCustodyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleCustodiesService.finalize>[1];
    }) => vehicleCustodiesService.finalize(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-custodies", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicles", response.data.vehicle_id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCancelVehicleCustodyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof vehicleCustodiesService.cancel>[1];
    }) => vehicleCustodiesService.cancel(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["vehicle-custodies"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-custodies", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({
        queryKey: ["vehicles", response.data.vehicle_id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
