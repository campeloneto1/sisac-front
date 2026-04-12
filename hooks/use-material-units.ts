"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { materialUnitsService } from "@/services/material-units/service";
import type { MaterialUnitFilters } from "@/types/material-unit.type";

export function useMaterialUnits(
  materialId: number | string,
  filters: MaterialUnitFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["material-units", materialId, filters],
    queryFn: () => materialUnitsService.index(materialId, filters),
    enabled: Boolean(materialId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMaterialUnit(
  materialId: number | string,
  unitId: number | string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["material-units", materialId, unitId],
    queryFn: () => materialUnitsService.show(materialId, unitId),
    enabled: Boolean(materialId) && Boolean(unitId) && enabled,
  });
}
