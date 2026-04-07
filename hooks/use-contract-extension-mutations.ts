"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractExtensionsService } from "@/services/contract-extensions/service";

export function useCreateContractExtensionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof contractExtensionsService.create>[1]) =>
      contractExtensionsService.create(contractId, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "extensions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractExtensionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractExtensionsService.update>[2] }) =>
      contractExtensionsService.update(contractId, id, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "extensions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractExtensionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => contractExtensionsService.remove(contractId, id),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "extensions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
