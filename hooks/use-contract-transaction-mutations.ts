"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractTransactionsService } from "@/services/contract-transactions/service";

export function useCreateContractTransactionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof contractTransactionsService.create>[1]) =>
      contractTransactionsService.create(contractId, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "transactions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractTransactionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractTransactionsService.update>[2] }) =>
      contractTransactionsService.update(contractId, id, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "transactions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractTransactionMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => contractTransactionsService.remove(contractId, id),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "transactions"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
