"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { coursesService } from "@/services/courses/service";
import type { CourseFilters } from "@/types/course.type";

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => coursesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => coursesService.show(id),
    enabled: Boolean(id),
  });
}
