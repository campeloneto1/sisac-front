"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { banksService } from "@/services/banks/service";

export function useCreateBankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: banksService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateBankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof banksService.update>[1] }) =>
      banksService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      queryClient.invalidateQueries({ queryKey: ["banks", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteBankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: banksService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
