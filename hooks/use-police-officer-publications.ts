"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerPublicationsService } from "@/services/police-officer-publications/service";
import type { PoliceOfficerPublicationFilters } from "@/types/police-officer-publication.type";

export function usePoliceOfficerPublications(
  filters: PoliceOfficerPublicationFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-publications", filters],
    queryFn: () => policeOfficerPublicationsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPublication(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-publications", id],
    queryFn: () => policeOfficerPublicationsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
