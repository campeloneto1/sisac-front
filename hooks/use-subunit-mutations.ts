"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { subunitsService } from "@/services/subunits/service";

export function useCreateSubunitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subunitsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["subunits"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateSubunitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof subunitsService.update>[1] }) =>
      subunitsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["subunits"] });
      queryClient.invalidateQueries({ queryKey: ["subunits", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteSubunitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subunitsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["subunits"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
