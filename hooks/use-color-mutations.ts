"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { colorsService } from "@/services/colors/service";

export function useCreateColorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: colorsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateColorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof colorsService.update>[1];
    }) => colorsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      queryClient.invalidateQueries({ queryKey: ["colors", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteColorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: colorsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
