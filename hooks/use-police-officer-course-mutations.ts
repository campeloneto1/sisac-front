"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { policeOfficerCoursesService } from "@/services/police-officer-courses/service";

export function useCreatePoliceOfficerCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerCoursesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdatePoliceOfficerCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof policeOfficerCoursesService.update>[1] }) =>
      policeOfficerCoursesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-courses"] });
      queryClient.invalidateQueries({ queryKey: ["police-officer-courses", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeletePoliceOfficerCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policeOfficerCoursesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["police-officer-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
