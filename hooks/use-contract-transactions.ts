"use client";

import { useQuery } from "@tanstack/react-query";

import { contractTransactionsService } from "@/services/contract-transactions/service";
import type { ContractTransactionFilters } from "@/types/contract-transaction.type";

export function useContractTransactions(contractId: number | string, filters: ContractTransactionFilters, enabled = true) {
  return useQuery({
    queryKey: ["contracts", contractId, "transactions", filters],
    queryFn: () => contractTransactionsService.index(contractId, filters),
    enabled: Boolean(contractId) && enabled,
  });
}
