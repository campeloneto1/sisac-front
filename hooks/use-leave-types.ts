"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { leaveTypesService } from "@/services/leave-types/service";
import type { LeaveTypeFilters } from "@/types/leave-type.type";

export function useLeaveTypes(filters: LeaveTypeFilters) {
  return useQuery({
    queryKey: ["leave-types", filters],
    queryFn: () => leaveTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLeaveType(id: number | string) {
  return useQuery({
    queryKey: ["leave-types", id],
    queryFn: () => leaveTypesService.show(id),
    enabled: Boolean(id),
  });
}
