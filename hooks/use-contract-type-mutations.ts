"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractTypesService } from "@/services/contract-types/service";

export function useCreateContractTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractTypesService.update>[1] }) =>
      contractTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["contract-types"] });
      queryClient.invalidateQueries({ queryKey: ["contract-types", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contract-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
