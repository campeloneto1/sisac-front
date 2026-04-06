"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { banksService } from "@/services/banks/service";
import type { BankFilters } from "@/types/bank.type";

export function useBanks(filters: BankFilters) {
  return useQuery({
    queryKey: ["banks", filters],
    queryFn: () => banksService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useBank(id: number | string) {
  return useQuery({
    queryKey: ["banks", id],
    queryFn: () => banksService.show(id),
    enabled: Boolean(id),
  });
}
