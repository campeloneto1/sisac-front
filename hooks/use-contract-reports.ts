"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { contractReportsService } from "@/services/contract-reports/service";
import type { ContractReportFilters } from "@/types/contract-report.type";

export function useContractStatusOverviewReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "status-overview", filters], queryFn: () => contractReportsService.statusOverview(filters), enabled });
}
export function useContractExecutionOverviewReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "execution-overview", filters], queryFn: () => contractReportsService.executionOverview(filters), enabled });
}
export function useContractActiveReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "active", filters], queryFn: () => contractReportsService.active(filters), enabled, placeholderData: keepPreviousData });
}
export function useContractExpiringReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "expiring", filters], queryFn: () => contractReportsService.expiring(filters), enabled, placeholderData: keepPreviousData });
}
export function useContractTransactionsReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "transactions", filters], queryFn: () => contractReportsService.transactions(filters), enabled, placeholderData: keepPreviousData });
}
export function useContractAlertsReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "alerts", filters], queryFn: () => contractReportsService.alerts(filters), enabled, placeholderData: keepPreviousData });
}
export function useContractStatusChangesReport(filters: ContractReportFilters, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "status-changes", filters], queryFn: () => contractReportsService.statusChanges(filters), enabled, placeholderData: keepPreviousData });
}
export function useContractPanelReport(contractId: number | string, enabled = true) {
  return useQuery({ queryKey: ["contract-reports", "contract-panel", contractId], queryFn: () => contractReportsService.contractPanel(contractId), enabled: Boolean(contractId) && enabled });
}
