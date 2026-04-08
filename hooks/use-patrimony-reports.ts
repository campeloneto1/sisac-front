"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { patrimonyReportsService } from "@/services/patrimony-reports/service";
import type { PatrimonyReportFilters } from "@/types/patrimony-report.type";

export function usePatrimonyStatusOverviewReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "status-overview", filters], queryFn: () => patrimonyReportsService.statusOverview(filters), enabled });
}
export function usePatrimonyTypeDistributionReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "type-distribution", filters], queryFn: () => patrimonyReportsService.typeDistribution(filters), enabled });
}
export function usePatrimonySectorDistributionReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "sector-distribution", filters], queryFn: () => patrimonyReportsService.sectorDistribution(filters), enabled });
}
export function usePatrimonyActiveReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "active", filters], queryFn: () => patrimonyReportsService.active(filters), enabled, placeholderData: keepPreviousData });
}
export function usePatrimonyWriteOffsReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "write-offs", filters], queryFn: () => patrimonyReportsService.writeOffs(filters), enabled, placeholderData: keepPreviousData });
}
export function usePatrimonyMovementsReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "movements", filters], queryFn: () => patrimonyReportsService.movements(filters), enabled, placeholderData: keepPreviousData });
}
export function usePatrimonyAcquisitionCostsReport(filters: PatrimonyReportFilters, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "acquisition-costs", filters], queryFn: () => patrimonyReportsService.acquisitionCosts(filters), enabled });
}
export function usePatrimonyPanelReport(patrimonyId: number | string, enabled = true) {
  return useQuery({ queryKey: ["patrimony-reports", "patrimony-panel", patrimonyId], queryFn: () => patrimonyReportsService.patrimonyPanel(patrimonyId), enabled: Boolean(patrimonyId) && enabled });
}
