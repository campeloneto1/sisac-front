"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { serviceStatusHistoriesService } from "@/services/service-status-histories/service";

export function useCreateServiceStatusHistoryMutation(
  serviceId: number | string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceStatusHistoriesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service-status-history"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateServiceStatusHistoryMutation(
  serviceId: number | string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof serviceStatusHistoriesService.update>[1];
    }) => serviceStatusHistoriesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service-status-history"] });
      queryClient.invalidateQueries({
        queryKey: ["service-status-history", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteServiceStatusHistoryMutation(
  serviceId: number | string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceStatusHistoriesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["services", serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service-status-history"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
