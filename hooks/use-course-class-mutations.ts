"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { courseClassesService } from "@/services/course-classes/service";

export function useCreateCourseClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseClassesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourseClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof courseClassesService.update>[1] }) =>
      courseClassesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes", variables.id] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourseClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseClassesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
