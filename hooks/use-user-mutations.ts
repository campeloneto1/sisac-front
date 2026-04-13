"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { usersService } from "@/services/users/service";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof usersService.update>[1] }) =>
      usersService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useResetUserPasswordMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof usersService.resetPassword>[1] }) =>
      usersService.resetPassword(id, payload),
    onSuccess(response) {
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRevokeAccessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => usersService.revokeAccess(id),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRenewAccessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, authorized_until }: { id: number | string; authorized_until?: string }) =>
      usersService.renewAccess(id, authorized_until),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

