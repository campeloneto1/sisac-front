"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractStatusHistoriesService } from "@/services/contract-status-histories/service";

export function useCreateContractStatusHistoryMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contractStatusHistoriesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contract-status-histories"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
