"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { subunitsService } from "@/services/subunits/service";
import type { SubunitFilters } from "@/types/subunit.type";

export function useSubunits(filters: SubunitFilters) {
  return useQuery({
    queryKey: ["subunits", filters],
    queryFn: () => subunitsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSubunitItem(id: number | string) {
  return useQuery({
    queryKey: ["subunits", id],
    queryFn: () => subunitsService.show(id),
    enabled: Boolean(id),
  });
}

export function useSubunitCities(search?: string) {
  return useQuery({
    queryKey: ["subunit-cities", search ?? ""],
    queryFn: () => subunitsService.cities(search),
  });
}

export function useSubunitUnits(search?: string) {
  return useQuery({
    queryKey: ["subunit-units", search ?? ""],
    queryFn: () => subunitsService.units(search),
  });
}

export function useSubunitPoliceOfficers(search?: string) {
  return useQuery({
    queryKey: ["subunit-police-officers", search ?? ""],
    queryFn: () => subunitsService.policeOfficers(search),
  });
}
