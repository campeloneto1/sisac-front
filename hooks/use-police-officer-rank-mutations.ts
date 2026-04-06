"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerRanksService } from "@/services/police-officer-ranks/service";

export function useCreatePoliceOfficerRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerRanksService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-ranks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerRanksService.update>[1] }) =>
      policeOfficerRanksService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-ranks", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerRanksService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-ranks"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useBulkPromotePoliceOfficerRankMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerRanksService.bulkPromote,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
