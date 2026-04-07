"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleRentalsService } from "@/services/vehicle-rentals/service";
import type { VehicleRentalFilters } from "@/types/vehicle-rental.type";

export function useVehicleRentals(filters: VehicleRentalFilters) {
  return useQuery({
    queryKey: ["vehicle-rentals", filters],
    queryFn: () => vehicleRentalsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleRental(id: number | string) {
  return useQuery({
    queryKey: ["vehicle-rentals", id],
    queryFn: () => vehicleRentalsService.show(id),
    enabled: Boolean(id),
  });
}
