"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { leaveTypesService } from "@/services/leave-types/service";

export function useCreateLeaveTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTypesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLeaveTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof leaveTypesService.update>[1] }) =>
      leaveTypesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      queryClient.invalidateQueries({ queryKey: ["leave-types", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteLeaveTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTypesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
