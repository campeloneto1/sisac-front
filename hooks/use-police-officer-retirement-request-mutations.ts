"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerRetirementRequestsService } from "@/services/police-officer-retirement-requests/service";

export function useCreatePoliceOfficerRetirementRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerRetirementRequestsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-retirement-requests"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerRetirementRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: Parameters<
        typeof policeOfficerRetirementRequestsService.update
      >[1];
    }) => policeOfficerRetirementRequestsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-retirement-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["police-officer-retirement-requests", variables.id],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerRetirementRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerRetirementRequestsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({
        queryKey: ["police-officer-retirement-requests"],
      });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
