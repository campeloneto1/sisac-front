"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceReportsService } from "@/services/service-reports/service";
import type { ServiceReportFilters } from "@/types/service-report.type";

export function useServiceStatusOverviewReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "status-overview", filters], queryFn: () => serviceReportsService.statusOverview(filters), enabled });
}
export function useServicePriorityOverviewReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "priority-overview", filters], queryFn: () => serviceReportsService.priorityOverview(filters), enabled });
}
export function useServiceByTypeReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "by-type", filters], queryFn: () => serviceReportsService.byType(filters), enabled });
}
export function useServiceOperationalBacklogReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "operational-backlog", filters], queryFn: () => serviceReportsService.operationalBacklog(filters), enabled, placeholderData: keepPreviousData });
}
export function useServiceCompletedReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "completed", filters], queryFn: () => serviceReportsService.completed(filters), enabled, placeholderData: keepPreviousData });
}
export function useServiceCostSummaryReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "cost-summary", filters], queryFn: () => serviceReportsService.costSummary(filters), enabled });
}
export function useServiceStatusChangesReport(filters: ServiceReportFilters, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "status-changes", filters], queryFn: () => serviceReportsService.statusChanges(filters), enabled, placeholderData: keepPreviousData });
}
export function useServicePanelReport(serviceId: number | string, enabled = true) {
  return useQuery({ queryKey: ["service-reports", "service-panel", serviceId], queryFn: () => serviceReportsService.servicePanel(serviceId), enabled: Boolean(serviceId) && enabled });
}
