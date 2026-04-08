"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { courseClassesService } from "@/services/course-classes/service";
import type { CourseClassFilters } from "@/types/course-class.type";

export function useCourseClasses(filters: CourseClassFilters, enabled = true) {
  return useQuery({
    queryKey: ["course-classes", filters],
    queryFn: () => courseClassesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCourseClass(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["course-classes", id],
    queryFn: () => courseClassesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
