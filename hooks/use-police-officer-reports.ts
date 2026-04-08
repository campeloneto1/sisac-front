"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerReportsService } from "@/services/police-officer-reports/service";
import type { PoliceOfficerReportFilters } from "@/types/police-officer-report.type";

export function usePoliceOfficerActiveInactiveReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "active-inactive", filters],
    queryFn: () => policeOfficerReportsService.activeInactive(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerEffectiveBySectorReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "effective-by-sector", filters],
    queryFn: () => policeOfficerReportsService.effectiveBySector(filters),
    enabled,
  });
}

export function usePoliceOfficerRankDistributionReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "rank-distribution", filters],
    queryFn: () => policeOfficerReportsService.rankDistribution(filters),
    enabled,
  });
}

export function usePoliceOfficerLeavesReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "leaves", filters],
    queryFn: () => policeOfficerReportsService.leaves(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerLeavesByTypeDurationReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "leaves-by-type-duration", filters],
    queryFn: () => policeOfficerReportsService.leavesByTypeDuration(filters),
    enabled,
  });
}

export function usePoliceOfficerVacationsOverviewReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "vacations-overview", filters],
    queryFn: () => policeOfficerReportsService.vacationsOverview(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerVacationBalancesReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "vacation-balances", filters],
    queryFn: () => policeOfficerReportsService.vacationBalances(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerAllocationHistoryReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "allocation-history", filters],
    queryFn: () => policeOfficerReportsService.allocationHistory(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPromotionEligibilityReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "promotion-eligibility", filters],
    queryFn: () => policeOfficerReportsService.promotionEligibility(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPromotionHistoryReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "promotion-history", filters],
    queryFn: () => policeOfficerReportsService.promotionHistory(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPendingCopemReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "pending-copem", filters],
    queryFn: () => policeOfficerReportsService.pendingCopem(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerCoursesOverviewReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "courses-overview", filters],
    queryFn: () => policeOfficerReportsService.coursesOverview(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerPendingCertificatesReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "pending-certificates", filters],
    queryFn: () => policeOfficerReportsService.pendingCertificates(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerRetirementRequestsReport(
  filters: PoliceOfficerReportFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "retirement-requests", filters],
    queryFn: () => policeOfficerReportsService.retirementRequests(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerFunctionalPanelReport(
  policeOfficerId: number | string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-reports", "functional-panel", policeOfficerId],
    queryFn: () => policeOfficerReportsService.functionalPanel(policeOfficerId),
    enabled: Boolean(policeOfficerId) && enabled,
  });
}
