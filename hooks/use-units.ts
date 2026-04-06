"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { unitsService } from "@/services/units/service";
import type { UnitFilters } from "@/types/unit.type";

export function useUnits(filters: UnitFilters) {
  return useQuery({
    queryKey: ["units", filters],
    queryFn: () => unitsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUnitItem(id: number | string) {
  return useQuery({
    queryKey: ["units", id],
    queryFn: () => unitsService.show(id),
    enabled: Boolean(id),
  });
}

export function useUnitCities(search?: string) {
  return useQuery({
    queryKey: ["unit-cities", search ?? ""],
    queryFn: () => unitsService.cities(search),
  });
}

export function useUnitPoliceOfficers(search?: string) {
  return useQuery({
    queryKey: ["unit-police-officers", search ?? ""],
    queryFn: () => unitsService.policeOfficers(search),
  });
}
