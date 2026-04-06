"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { unitsService } from "@/services/units/service";

export function useCreateUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unitsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof unitsService.update>[1] }) =>
      unitsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["units", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unitsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
