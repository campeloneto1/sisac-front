"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleMaintenancesService } from "@/services/vehicle-maintenances/service";
import type { VehicleMaintenanceFilters } from "@/types/vehicle-maintenance.type";

export function useVehicleMaintenances(filters: VehicleMaintenanceFilters) {
  return useQuery({
    queryKey: ["vehicle-maintenances", filters],
    queryFn: () => vehicleMaintenancesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleMaintenance(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-maintenances", id],
    queryFn: () => vehicleMaintenancesService.show(id),
    enabled: Boolean(id),
  });
}
