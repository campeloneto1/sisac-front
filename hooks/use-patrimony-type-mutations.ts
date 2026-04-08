"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { patrimonyTypesService } from "@/services/patrimony-types/service";

export function useCreatePatrimonyTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patrimonyTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["patrimony-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePatrimonyTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof patrimonyTypesService.update>[1];
    }) => patrimonyTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["patrimony-types"] });
      queryClient.invalidateQueries({
        queryKey: ["patrimony-types", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePatrimonyTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patrimonyTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["patrimony-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
