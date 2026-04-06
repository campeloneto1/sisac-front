"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { ranksService } from "@/services/ranks/service";

export function useCreateRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ranksService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof ranksService.update>[1] }) =>
      ranksService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      queryClient.invalidateQueries({ queryKey: ["ranks", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ranksService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["ranks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
