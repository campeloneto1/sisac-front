"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerRetirementRequestsService } from "@/services/police-officer-retirement-requests/service";
import type { PoliceOfficerRetirementRequestFilters } from "@/types/police-officer-retirement-request.type";

export function usePoliceOfficerRetirementRequests(
  filters: PoliceOfficerRetirementRequestFilters,
) {
  return useQuery({
    queryKey: ["police-officer-retirement-requests", filters],
    queryFn: () => policeOfficerRetirementRequestsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerRetirementRequest(id: number | string) {
  return useQuery({
    queryKey: ["police-officer-retirement-requests", id],
    queryFn: () => policeOfficerRetirementRequestsService.show(id),
    enabled: Boolean(id),
  });
}
