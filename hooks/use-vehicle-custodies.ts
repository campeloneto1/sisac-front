"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleCustodiesService } from "@/services/vehicle-custodies/service";
import type { VehicleCustodyFilters } from "@/types/vehicle-custody.type";

export function useVehicleCustodies(filters: VehicleCustodyFilters) {
  return useQuery({
    queryKey: ["vehicle-custodies", filters],
    queryFn: () => vehicleCustodiesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleCustody(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-custodies", id],
    queryFn: () => vehicleCustodiesService.show(id),
    enabled: Boolean(id),
  });
}
