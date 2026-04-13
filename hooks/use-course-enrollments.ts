"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { courseEnrollmentsService } from "@/services/course-enrollments/service";
import type { CourseEnrollmentFilters } from "@/types/course-enrollment.type";

export function useCourseEnrollments(filters: CourseEnrollmentFilters, enabled = true) {
  return useQuery({
    queryKey: ["course-enrollments", filters],
    queryFn: () => courseEnrollmentsService.index(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCourseEnrollment(id: number | string) {
  return useQuery({
    queryKey: ["course-enrollments", id],
    queryFn: () => courseEnrollmentsService.show(id),
    enabled: Boolean(id),
  });
}
