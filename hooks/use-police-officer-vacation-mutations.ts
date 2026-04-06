"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerVacationsService } from "@/services/police-officer-vacations/service";

export function useCreatePoliceOfficerVacationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerVacationsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerVacationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerVacationsService.update>[1] }) =>
      policeOfficerVacationsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerVacationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerVacationsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacation-periods"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCreatePoliceOfficerVacationPeriodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerVacationsService.periodsCreate,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacation-periods"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerVacationPeriodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerVacationsService.periodsUpdate>[1] }) =>
      policeOfficerVacationsService.periodsUpdate(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacation-periods"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacation-periods", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerVacationPeriodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerVacationsService.periodsRemove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacations"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-vacation-periods"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
