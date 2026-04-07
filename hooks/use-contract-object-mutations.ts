"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractObjectsService } from "@/services/contract-objects/service";

export function useCreateContractObjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractObjectsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-objects"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractObjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractObjectsService.update>[1] }) =>
      contractObjectsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["contract-objects"] });
      queryClient.invalidateQueries({ queryKey: ["contract-objects", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractObjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractObjectsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-objects"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
