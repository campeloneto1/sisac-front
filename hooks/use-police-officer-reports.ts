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
