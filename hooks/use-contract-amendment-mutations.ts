"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { contractAmendmentsService } from "@/services/contract-amendments/service";

export function useCreateContractAmendmentMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof contractAmendmentsService.create>[1]) =>
      contractAmendmentsService.create(contractId, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "amendments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateContractAmendmentMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof contractAmendmentsService.update>[2] }) =>
      contractAmendmentsService.update(contractId, id, payload),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "amendments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteContractAmendmentMutation(contractId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => contractAmendmentsService.remove(contractId, id),
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId, "amendments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
