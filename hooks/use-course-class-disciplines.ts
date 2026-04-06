"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { courseClassDisciplinesService } from "@/services/course-class-disciplines/service";
import type { CourseClassDisciplineFilters } from "@/types/course-class-discipline.type";

export function useCourseClassDisciplines(filters: CourseClassDisciplineFilters, enabled = true) {
  return useQuery({
    queryKey: ["course-class-disciplines", filters],
    queryFn: () => courseClassDisciplinesService.index(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCourseClassDiscipline(id: number | string) {
  return useQuery({
    queryKey: ["course-class-disciplines", id],
    queryFn: () => courseClassDisciplinesService.show(id),
    enabled: Boolean(id),
  });
}
