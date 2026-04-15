"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficersService } from "@/services/police-officers/service";

export function useCreatePoliceOfficerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficersService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficersService.update>[1] }) =>
      policeOfficersService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficersService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUploadPoliceOfficerProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, photo }: { id: number | string; photo: File }) =>
      policeOfficersService.uploadProfilePhoto(id, photo),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerProfilePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => policeOfficersService.deleteProfilePhoto(id),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officers"] });
      queryClient.invalidateQueries({ queryKey: ["police-officers", variables] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
