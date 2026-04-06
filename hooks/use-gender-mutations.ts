"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { gendersService } from "@/services/genders/service";

export function useCreateGenderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gendersService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateGenderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof gendersService.update>[1] }) =>
      gendersService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
      queryClient.invalidateQueries({ queryKey: ["genders", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteGenderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gendersService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["genders"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
