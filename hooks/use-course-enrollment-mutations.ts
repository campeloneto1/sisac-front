"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { courseEnrollmentsService } from "@/services/course-enrollments/service";

export function useCreateCourseEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseEnrollmentsService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourseEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof courseEnrollmentsService.update>[1] }) =>
      courseEnrollmentsService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["course-enrollments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourseEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseEnrollmentsService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
