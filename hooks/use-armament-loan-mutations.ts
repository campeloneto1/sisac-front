"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { armamentLoansService } from "@/services/armament-loans/service";

export function useCreateArmamentLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentLoansService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["armament-loans"] });
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateArmamentLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentLoansService.update>[1];
    }) => armamentLoansService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["armament-loans"] });
      queryClient.invalidateQueries({
        queryKey: ["armament-loans", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteArmamentLoanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: armamentLoansService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["armament-loans"] });
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useMarkArmamentLoanReturnedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof armamentLoansService.markAsReturned>[1];
    }) => armamentLoansService.markAsReturned(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["armament-loans"] });
      queryClient.invalidateQueries({
        queryKey: ["armament-loans", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["armaments"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
