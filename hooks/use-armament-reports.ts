"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentReportsService } from "@/services/armament-reports/service";
import type { ArmamentReportFilters } from "@/types/armament-report.type";

export function useArmamentInventoryReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "inventory", filters], queryFn: () => armamentReportsService.inventory(filters), enabled });
}
export function useArmamentAvailabilityReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "availability", filters], queryFn: () => armamentReportsService.availability(filters), enabled });
}
export function useArmamentAvailableUnitsReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "available-units", filters], queryFn: () => armamentReportsService.availableUnits(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentAvailableBatchesReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "available-batches", filters], queryFn: () => armamentReportsService.availableBatches(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentExpiringUnitsReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "expiring-units", filters], queryFn: () => armamentReportsService.expiringUnits(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentExpiringBatchesReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "expiring-batches", filters], queryFn: () => armamentReportsService.expiringBatches(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentLoansReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "loans", filters], queryFn: () => armamentReportsService.loans(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentActiveLoansReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "active-loans", filters], queryFn: () => armamentReportsService.activeLoans(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentCautelasReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "cautelas", filters], queryFn: () => armamentReportsService.cautelas(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentReturnDivergencesReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "return-divergences", filters], queryFn: () => armamentReportsService.returnDivergences(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentMovementsReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "movements", filters], queryFn: () => armamentReportsService.movements(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentOccurrencesReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "occurrences", filters], queryFn: () => armamentReportsService.occurrences(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentCriticalOccurrencesReport(filters: ArmamentReportFilters, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "critical-occurrences", filters], queryFn: () => armamentReportsService.criticalOccurrences(filters), enabled, placeholderData: keepPreviousData });
}
export function useArmamentPanelReport(armamentId: number | string, enabled = true) {
  return useQuery({ queryKey: ["armament-reports", "armament-panel", armamentId], queryFn: () => armamentReportsService.armamentPanel(armamentId), enabled: Boolean(armamentId) && enabled });
}
