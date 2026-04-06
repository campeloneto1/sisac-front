"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { sectorsService } from "@/services/sectors/service";
import type { SectorFilters } from "@/types/sector.type";

export function useSectors(filters: SectorFilters, enabled = true) {
  return useQuery({
    queryKey: ["sectors", filters],
    queryFn: () => sectorsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSector(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["sectors", id],
    queryFn: () => sectorsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useSectorPoliceOfficers(search?: string, enabled = true) {
  return useQuery({
    queryKey: ["sector-police-officers", search ?? ""],
    queryFn: () => sectorsService.policeOfficers(search),
    enabled,
  });
}
