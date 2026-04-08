"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentLoansService } from "@/services/armament-loans/service";
import type { ArmamentLoanFilters } from "@/types/armament-loan.type";

export function useArmamentLoans(filters: ArmamentLoanFilters, enabled = true) {
  return useQuery({
    queryKey: ["armament-loans", filters],
    queryFn: () => armamentLoansService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useArmamentLoan(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["armament-loans", id],
    queryFn: () => armamentLoansService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
