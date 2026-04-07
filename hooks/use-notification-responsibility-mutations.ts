"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { notificationResponsibilitiesService } from "@/services/notification-responsibilities/service";

export function useCreateNotificationResponsibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationResponsibilitiesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["notification-responsibilities"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateNotificationResponsibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof notificationResponsibilitiesService.update>[1] }) =>
      notificationResponsibilitiesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["notification-responsibilities"] });
      queryClient.invalidateQueries({ queryKey: ["notification-responsibilities", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteNotificationResponsibilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationResponsibilitiesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["notification-responsibilities"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
