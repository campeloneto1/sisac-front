"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { materialLoansService } from "@/services/material-loans/service";

export function useCreateMaterialLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialLoansService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["material-loans"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateMaterialLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof materialLoansService.update>[1];
    }) => materialLoansService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["material-loans"] });
      queryClient.invalidateQueries({
        queryKey: ["material-loans", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteMaterialLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialLoansService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["material-loans"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useMarkMaterialLoanReturnedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof materialLoansService.markAsReturned>[1];
    }) => materialLoansService.markAsReturned(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["material-loans"] });
      queryClient.invalidateQueries({
        queryKey: ["material-loans", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
