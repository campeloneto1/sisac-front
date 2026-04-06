"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { courseDisciplinesService } from "@/services/course-disciplines/service";
import type { CourseDisciplineFilters } from "@/types/course-discipline.type";

export function useCourseDisciplines(filters: CourseDisciplineFilters, enabled = true) {
  return useQuery({
    queryKey: ["course-disciplines", filters],
    queryFn: () => courseDisciplinesService.index(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCourseDiscipline(id: number | string) {
  return useQuery({
    queryKey: ["course-disciplines", id],
    queryFn: () => courseDisciplinesService.show(id),
    enabled: Boolean(id),
  });
}
