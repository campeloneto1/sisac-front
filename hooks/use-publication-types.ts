"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { publicationTypesService } from "@/services/publication-types/service";
import type { PublicationTypeFilters } from "@/types/publication-type.type";

export function usePublicationTypes(filters: PublicationTypeFilters) {
  return useQuery({
    queryKey: ["publication-types", filters],
    queryFn: () => publicationTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePublicationType(id: number | string) {
  return useQuery({
    queryKey: ["publication-types", id],
    queryFn: () => publicationTypesService.show(id),
    enabled: Boolean(id),
  });
}
