"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { companiesService } from "@/services/companies/service";
import type { CompanyFilters } from "@/types/company.type";

export function useCompanies(filters: CompanyFilters) {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: () => companiesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCompany(id: number | string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: () => companiesService.show(id),
    enabled: Boolean(id),
  });
}
