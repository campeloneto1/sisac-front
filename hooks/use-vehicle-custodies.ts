"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleCustodiesService } from "@/services/vehicle-custodies/service";
import type { VehicleCustodyFilters } from "@/types/vehicle-custody.type";

export function useVehicleCustodies(
  filters: VehicleCustodyFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-custodies", filters],
    queryFn: () => vehicleCustodiesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleCustody(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["vehicle-custodies", id],
    queryFn: () => vehicleCustodiesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
