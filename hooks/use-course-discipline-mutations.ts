"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import { courseDisciplinesService } from "@/services/course-disciplines/service";

export function useCreateCourseDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseDisciplinesService.create,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateCourseDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof courseDisciplinesService.update>[1] }) =>
      courseDisciplinesService.update(id, payload),
    onSuccess(response, variables) {
      queryClient.invalidateQueries({ queryKey: ["course-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["course-disciplines", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeleteCourseDisciplineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseDisciplinesService.remove,
    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: ["course-disciplines"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(response.message);
    },
    onError(error) {
      toast.error(getApiErrorMessage(error));
    },
  });
}
