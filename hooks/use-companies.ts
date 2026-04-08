"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { companiesService } from "@/services/companies/service";
import type { CompanyFilters } from "@/types/company.type";

export function useCompanies(filters: CompanyFilters, enabled = true) {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: () => companiesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCompany(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: () => companiesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
