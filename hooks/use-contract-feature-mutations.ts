"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractFeaturesService } from "@/services/contract-features/service";

export function useCreateContractFeatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractFeaturesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-features"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractFeatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractFeaturesService.update>[1] }) =>
      contractFeaturesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["contract-features"] });
      queryClient.invalidateQueries({ queryKey: ["contract-features", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractFeatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractFeaturesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-features"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
