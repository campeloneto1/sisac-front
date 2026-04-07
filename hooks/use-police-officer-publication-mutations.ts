"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerPublicationsService } from "@/services/police-officer-publications/service";

export function useCreatePoliceOfficerPublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerPublicationsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-publications"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerPublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<typeof policeOfficerPublicationsService.update>[1];
    }) => policeOfficerPublicationsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-publications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["police-officer-publications", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerPublicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerPublicationsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-publications"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
