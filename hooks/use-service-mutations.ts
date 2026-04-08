"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { servicesService } from "@/services/services/service";

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: servicesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof servicesService.update>[1];
    }) => servicesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: servicesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
