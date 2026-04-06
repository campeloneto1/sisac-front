"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerAllocationsService } from "@/services/police-officer-allocations/service";

export function useCreatePoliceOfficerAllocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerAllocationsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerAllocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerAllocationsService.update>[1] }) =>
      policeOfficerAllocationsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-allocations", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerAllocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerAllocationsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
