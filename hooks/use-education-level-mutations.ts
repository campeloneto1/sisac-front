"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { educationLevelsService } from "@/services/education-levels/service";

export function useCreateEducationLevelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: educationLevelsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["education-levels"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateEducationLevelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof educationLevelsService.update>[1] }) =>
      educationLevelsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["education-levels"] });
      queryClient.invalidateQueries({ queryKey: ["education-levels", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteEducationLevelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: educationLevelsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["education-levels"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
