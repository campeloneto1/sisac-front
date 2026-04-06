"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerCoursesService } from "@/services/police-officer-courses/service";
import type { PoliceOfficerCourseFilters } from "@/types/police-officer-course.type";

export function usePoliceOfficerCourses(filters: PoliceOfficerCourseFilters, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-courses", filters],
    queryFn: () => policeOfficerCoursesService.index(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function usePoliceOfficerCourse(id: number | string) {
  return useQuery({
    queryKey: ["police-officer-courses", id],
    queryFn: () => policeOfficerCoursesService.show(id),
    enabled: Boolean(id),
  });
}
