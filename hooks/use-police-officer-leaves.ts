"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerLeavesService } from "@/services/police-officer-leaves/service";
import type { PoliceOfficerLeaveFilters } from "@/types/police-officer-leave.type";

export function usePoliceOfficerLeaves(
  filters: PoliceOfficerLeaveFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-leaves", filters],
    queryFn: () => policeOfficerLeavesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerLeave(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-leaves", id],
    queryFn: () => policeOfficerLeavesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
