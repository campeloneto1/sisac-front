"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerLeavesService } from "@/services/police-officer-leaves/service";

export function useCreatePoliceOfficerLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerLeavesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-leaves"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerLeavesService.update>[1] }) =>
      policeOfficerLeavesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-leaves", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerLeaveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerLeavesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-leaves"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
