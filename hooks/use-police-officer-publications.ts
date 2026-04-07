"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerPublicationsService } from "@/services/police-officer-publications/service";
import type { PoliceOfficerPublicationFilters } from "@/types/police-officer-publication.type";

export function usePoliceOfficerPublications(
  filters: PoliceOfficerPublicationFilters,
) {
  return useQuery({
    queryKey: ["police-officer-publications", filters],
    queryFn: () => policeOfficerPublicationsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPublication(id: number | string) {
  return useQuery({
    queryKey: ["police-officer-publications", id],
    queryFn: () => policeOfficerPublicationsService.show(id),
    enabled: Boolean(id),
  });
}
