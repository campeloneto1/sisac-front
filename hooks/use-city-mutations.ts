"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { citiesService } from "@/services/cities/service";

export function useCreateCityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: citiesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof citiesService.update>[1] }) =>
      citiesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: citiesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
