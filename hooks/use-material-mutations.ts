"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { materialsService } from "@/services/materials/service";

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof materialsService.update>[1];
    }) => materialsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
