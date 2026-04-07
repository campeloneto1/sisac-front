"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehiclesService } from "@/services/vehicles/service";
import type { VehicleFilters } from "@/types/vehicle.type";

interface UseVehiclesOptions {
  enabled?: boolean;
}

export function useVehicles(
  filters: VehicleFilters,
  options: UseVehiclesOptions = {},
) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => vehiclesService.index(filters),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useAvailableVehicles(
  filters: VehicleFilters,
  options: UseVehiclesOptions = {},
) {
  return useQuery({
    queryKey: ["vehicles", "available", filters],
    queryFn: () => vehiclesService.available(filters),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useVehicle(id: number | string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesService.show(id),
    enabled: Boolean(id),
  });
}
