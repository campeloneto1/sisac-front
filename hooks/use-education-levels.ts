"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { educationLevelsService } from "@/services/education-levels/service";
import type { EducationLevelFilters } from "@/types/education-level.type";

export function useEducationLevels(filters: EducationLevelFilters) {
  return useQuery({
    queryKey: ["education-levels", filters],
    queryFn: () => educationLevelsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEducationLevel(id: number | string) {
  return useQuery({
    queryKey: ["education-levels", id],
    queryFn: () => educationLevelsService.show(id),
    enabled: Boolean(id),
  });
}
