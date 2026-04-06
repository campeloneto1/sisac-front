"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { assignmentsService } from "@/services/assignments/service";
import type { AssignmentFilters } from "@/types/assignment.type";

export function useAssignments(filters: AssignmentFilters) {
  return useQuery({
    queryKey: ["assignments", filters],
    queryFn: () => assignmentsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAssignment(id: number | string) {
  return useQuery({
    queryKey: ["assignments", id],
    queryFn: () => assignmentsService.show(id),
    enabled: Boolean(id),
  });
}
