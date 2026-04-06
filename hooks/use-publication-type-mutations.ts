"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { publicationTypesService } from "@/services/publication-types/service";

export function useCreatePublicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicationTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["publication-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePublicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof publicationTypesService.update>[1] }) =>
      publicationTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["publication-types"] });
      queryClient.invalidateQueries({ queryKey: ["publication-types", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePublicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicationTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["publication-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
