"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleTypesService } from "@/services/vehicle-types/service";
import type { VehicleTypeFilters } from "@/types/vehicle-type.type";

export function useVehicleTypes(filters: VehicleTypeFilters) {
  return useQuery({
    queryKey: ["vehicle-types", filters],
    queryFn: () => vehicleTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleType(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-types", id],
    queryFn: () => vehicleTypesService.show(id),
    enabled: Boolean(id),
  });
}
