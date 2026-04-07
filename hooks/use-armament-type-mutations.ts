"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { armamentTypesService } from "@/services/armament-types/service";

export function useCreateArmamentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["armament-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateArmamentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentTypesService.update>[1];
    }) => armamentTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["armament-types"] });
      queryClient.invalidateQueries({
        queryKey: ["armament-types", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteArmamentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["armament-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
