"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { patrimoniesService } from "@/services/patrimonies/service";

export function useCreatePatrimonyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patrimoniesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["patrimonies"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePatrimonyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof patrimoniesService.update>[1];
    }) => patrimoniesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["patrimonies"] });
      queryClient.invalidateQueries({ queryKey: ["patrimonies", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePatrimonyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patrimoniesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["patrimonies"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useTransferPatrimonyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof patrimoniesService.transfer>[1];
    }) => patrimoniesService.transfer(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["patrimonies"] });
      queryClient.invalidateQueries({ queryKey: ["patrimonies", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["patrimonies", variables.id, "history"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDisposePatrimonyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof patrimoniesService.dispose>[1];
    }) => patrimoniesService.dispose(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["patrimonies"] });
      queryClient.invalidateQueries({ queryKey: ["patrimonies", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["patrimonies", variables.id, "history"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
