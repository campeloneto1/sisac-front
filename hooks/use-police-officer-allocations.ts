"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerAllocationsService } from "@/services/police-officer-allocations/service";
import type { PoliceOfficerAllocationFilters } from "@/types/police-officer-allocation.type";

export function usePoliceOfficerAllocations(filters: PoliceOfficerAllocationFilters, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-allocations", filters],
    queryFn: () => policeOfficerAllocationsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerAllocation(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-allocations", id],
    queryFn: () => policeOfficerAllocationsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
