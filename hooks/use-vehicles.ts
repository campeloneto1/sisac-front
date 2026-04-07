"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehiclesService } from "@/services/vehicles/service";
import type { VehicleFilters } from "@/types/vehicle.type";

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => vehiclesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicle(id: number | string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesService.show(id),
    enabled: Boolean(id),
  });
}
