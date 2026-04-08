"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { serviceTypesService } from "@/services/service-types/service";

export function useCreateServiceTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateServiceTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof serviceTypesService.update>[1];
    }) => serviceTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({
        queryKey: ["service-types", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteServiceTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
