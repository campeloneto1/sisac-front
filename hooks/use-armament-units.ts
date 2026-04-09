"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentUnitsService } from "@/services/armament-units/service";
import type { ArmamentUnitFilters } from "@/types/armament-unit.type";

export function useArmamentUnits(
  armamentId: number | string,
  filters: ArmamentUnitFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["armament-units", armamentId, filters],
    queryFn: () => armamentUnitsService.index(armamentId, filters),
    enabled: Boolean(armamentId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useArmamentUnit(
  armamentId: number | string,
  unitId: number | string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["armament-units", armamentId, unitId],
    queryFn: () => armamentUnitsService.show(armamentId, unitId),
    enabled: Boolean(armamentId) && Boolean(unitId) && enabled,
  });
}
