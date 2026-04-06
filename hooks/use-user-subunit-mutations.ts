"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { userSubunitsService } from "@/services/user-subunits/service";

export function useCreateUserSubunitMutation(userId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userSubunitsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["user-subunits", userId] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteUserSubunitMutation(userId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userSubunitsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["user-subunits", userId] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
