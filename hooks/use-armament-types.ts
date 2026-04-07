"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentTypesService } from "@/services/armament-types/service";
import type { ArmamentTypeFilters } from "@/types/armament-type.type";

export function useArmamentTypes(filters: ArmamentTypeFilters) {
  return useQuery({
    queryKey: ["armament-types", filters],
    queryFn: () => armamentTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useArmamentType(id: number | string) {
  return useQuery({
    queryKey: ["armament-types", id],
    queryFn: () => armamentTypesService.show(id),
    enabled: Boolean(id),
  });
}
