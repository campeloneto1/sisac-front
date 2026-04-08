"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { materialTypesService } from "@/services/material-types/service";

export function useCreateMaterialTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["material-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateMaterialTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof materialTypesService.update>[1];
    }) => materialTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["material-types"] });
      queryClient.invalidateQueries({
        queryKey: ["material-types", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMaterialTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["material-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
