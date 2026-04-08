"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { vehicleReportsService } from "@/services/vehicle-reports/service";
import type { VehicleReportFilters } from "@/types/vehicle-report.type";

export function useVehicleFleetStatusReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "fleet-status", filters],
    queryFn: () => vehicleReportsService.fleetStatus(filters),
    enabled,
  });
}

export function useVehicleFleetCompositionReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "fleet-composition", filters],
    queryFn: () => vehicleReportsService.fleetComposition(filters),
    enabled,
  });
}

export function useVehicleAvailableReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "available", filters],
    queryFn: () => vehicleReportsService.available(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleUnavailableReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "unavailable", filters],
    queryFn: () => vehicleReportsService.unavailable(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleLoansReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "loans", filters],
    queryFn: () => vehicleReportsService.loans(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleActiveLoansReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "active-loans", filters],
    queryFn: () => vehicleReportsService.activeLoans(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleActiveCustodiesReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "active-custodies", filters],
    queryFn: () => vehicleReportsService.activeCustodies(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleMaintenancesReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "maintenances", filters],
    queryFn: () => vehicleReportsService.maintenances(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleMaintenanceCostsReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "maintenance-costs", filters],
    queryFn: () => vehicleReportsService.maintenanceCosts(filters),
    enabled,
  });
}

export function useVehicleFuelingsReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "fuelings", filters],
    queryFn: () => vehicleReportsService.fuelings(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleFuelCostsReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "fuel-costs", filters],
    queryFn: () => vehicleReportsService.fuelCosts(filters),
    enabled,
  });
}

export function useVehicleDamagesReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "damages", filters],
    queryFn: () => vehicleReportsService.damages(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleRentalsReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "rentals", filters],
    queryFn: () => vehicleReportsService.rentals(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehicleExpiringRentalsReport(
  filters: VehicleReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "expiring-rentals", filters],
    queryFn: () => vehicleReportsService.expiringRentals(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVehiclePanelReport(
  vehicleId: number | string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["vehicle-reports", "vehicle-panel", vehicleId],
    queryFn: () => vehicleReportsService.vehiclePanel(vehicleId),
    enabled: Boolean(vehicleId) && enabled,
  });
}
