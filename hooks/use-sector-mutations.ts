"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { sectorsService } from "@/services/sectors/service";

export function useCreateSectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sectorsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateSectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof sectorsService.update>[1] }) =>
      sectorsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      queryClient.invalidateQueries({ queryKey: ["sectors", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteSectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sectorsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
