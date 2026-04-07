"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { workshopsService } from "@/services/workshops/service";

export function useCreateWorkshopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workshopsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateWorkshopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof workshopsService.update>[1];
    }) => workshopsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      queryClient.invalidateQueries({ queryKey: ["workshops", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteWorkshopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workshopsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
