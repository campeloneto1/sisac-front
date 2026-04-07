"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleFuelingsService } from "@/services/vehicle-fuelings/service";
import type { VehicleFuelingFilters } from "@/types/vehicle-fueling.type";

export function useVehicleFuelings(filters: VehicleFuelingFilters) {
  return useQuery({
    queryKey: ["vehicle-fuelings", filters],
    queryFn: () => vehicleFuelingsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleFueling(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-fuelings", id],
    queryFn: () => vehicleFuelingsService.show(id),
    enabled: Boolean(id),
  });
}
