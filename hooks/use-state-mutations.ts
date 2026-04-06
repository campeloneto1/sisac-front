"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { statesService } from "@/services/states/service";

export function useCreateStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof statesService.update>[1] }) =>
      statesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["states", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
