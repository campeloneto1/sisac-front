"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleDamagesService } from "@/services/vehicle-damages/service";
import type { VehicleDamageFilters } from "@/types/vehicle-damage.type";

export function useVehicleDamages(filters: VehicleDamageFilters) {
  return useQuery({
    queryKey: ["vehicle-damages", filters],
    queryFn: () => vehicleDamagesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleDamage(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-damages", id],
    queryFn: () => vehicleDamagesService.show(id),
    enabled: Boolean(id),
  });
}
