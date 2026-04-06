"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { brandsService } from "@/services/brands/service";

export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof brandsService.update>[1] }) =>
      brandsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brands", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
