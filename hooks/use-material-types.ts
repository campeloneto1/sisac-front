"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { materialTypesService } from "@/services/material-types/service";
import type { MaterialTypeFilters } from "@/types/material-type.type";

export function useMaterialTypes(filters: MaterialTypeFilters) {
  return useQuery({
    queryKey: ["material-types", filters],
    queryFn: () => materialTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useMaterialType(id: number | string) {
  return useQuery({
    queryKey: ["material-types", id],
    queryFn: () => materialTypesService.show(id),
    enabled: Boolean(id),
  });
}
