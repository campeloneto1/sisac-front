"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { courseClassDisciplinesService } from "@/services/course-class-disciplines/service";

export function useCreateCourseClassDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseClassDisciplinesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-class-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourseClassDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof courseClassDisciplinesService.update>[1] }) =>
      courseClassDisciplinesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["course-class-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["course-class-disciplines", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourseClassDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseClassDisciplinesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-class-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["course-classes"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
