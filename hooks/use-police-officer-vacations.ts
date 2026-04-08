"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerVacationsService } from "@/services/police-officer-vacations/service";
import type { PoliceOfficerVacationFilters, PoliceOfficerVacationPeriodFilters } from "@/types/police-officer-vacation.type";

export function usePoliceOfficerVacations(
  filters: PoliceOfficerVacationFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["police-officer-vacations", filters],
    queryFn: () => policeOfficerVacationsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerVacation(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-vacations", id],
    queryFn: () => policeOfficerVacationsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}

export function usePoliceOfficerVacationPeriods(filters: PoliceOfficerVacationPeriodFilters, enabled = true) {
  return useQuery({
    queryKey: ["police-officer-vacation-periods", filters],
    queryFn: () => policeOfficerVacationsService.periodsIndex(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function usePoliceOfficerVacationPeriod(id: number | string) {
  return useQuery({
    queryKey: ["police-officer-vacation-periods", id],
    queryFn: () => policeOfficerVacationsService.periodsShow(id),
    enabled: Boolean(id),
  });
}
