"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { countriesService } from "@/services/countries/service";

export function useCreateCountryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countriesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCountryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof countriesService.update>[1] }) =>
      countriesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCountryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: countriesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
