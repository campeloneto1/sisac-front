"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { noticesService } from "@/services/notices/service";

export function useCreateNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noticesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof noticesService.update>[1] }) =>
      noticesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noticesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useMarkNoticeAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noticesService.markAsRead,
    onSuccess(response, noticeId) {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices", noticeId] });
      queryClient.invalidateQueries({ queryKey: ["my-notices"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useAcknowledgeNoticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: noticesService.acknowledge,
    onSuccess(response, noticeId) {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices", noticeId] });
      queryClient.invalidateQueries({ queryKey: ["my-notices"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
