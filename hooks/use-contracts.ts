"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { companiesService } from "@/services/companies/service";
import { contractObjectsService } from "@/services/contract-objects/service";
import { contractTypesService } from "@/services/contract-types/service";
import { contractsService } from "@/services/contracts/service";
import type { ContractFilters } from "@/types/contract.type";

export function useContracts(filters: ContractFilters, enabled = true) {
  return useQuery({
    queryKey: ["contracts", filters],
    queryFn: () => contractsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useContract(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => contractsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useContractCompanies(enabled = true) {
  return useQuery({
    queryKey: ["contract-company-options"],
    queryFn: () => companiesService.index({ per_page: 100 }),
    enabled,
  });
}

export function useContractTypesOptions(enabled = true) {
  return useQuery({
    queryKey: ["contract-type-options"],
    queryFn: () => contractTypesService.index({ per_page: 100 }),
    enabled,
  });
}

export function useContractObjectsOptions(enabled = true) {
  return useQuery({
    queryKey: ["contract-object-options"],
    queryFn: () => contractObjectsService.index({ per_page: 100 }),
    enabled,
  });
}

export function useRenewableContractsOptions(enabled = true) {
  return useQuery({
    queryKey: ["renewable-contract-options"],
    queryFn: () => contractsService.index({ per_page: 100 }),
    enabled,
  });
}
