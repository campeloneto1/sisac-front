"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleLoansService } from "@/services/vehicle-loans/service";
import type { VehicleLoanFilters } from "@/types/vehicle-loan.type";

export function useVehicleLoans(filters: VehicleLoanFilters, enabled = true) {
  return useQuery({
    queryKey: ["vehicle-loans", filters],
    queryFn: () => vehicleLoansService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleLoan(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["vehicle-loans", id],
    queryFn: () => vehicleLoansService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
