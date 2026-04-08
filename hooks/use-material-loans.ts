"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { materialLoansService } from "@/services/material-loans/service";
import type { MaterialLoanFilters } from "@/types/material-loan.type";

export function useMaterialLoans(filters: MaterialLoanFilters, enabled = true) {
  return useQuery({
    queryKey: ["material-loans", filters],
    queryFn: () => materialLoansService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMaterialLoan(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["material-loans", id],
    queryFn: () => materialLoansService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
