"use client";

import { useQuery } from "@tanstack/react-query";

import { policeOfficersService } from "@/services/police-officers/service";
import { contractRolesService } from "@/services/contract-roles/service";
import type { ContractRoleFilters } from "@/types/contract-role.type";

export function useContractRoles(contractId: number | string, filters: ContractRoleFilters, enabled = true) {
  return useQuery({
    queryKey: ["contracts", contractId, "roles", filters],
    queryFn: () => contractRolesService.index(contractId, filters),
    enabled: Boolean(contractId) && enabled,
  });
}

export function useContractRolePoliceOfficers(enabled = true) {
  return useQuery({
    queryKey: ["contract-role-police-officers"],
    queryFn: () => policeOfficersService.index({ per_page: 100, is_active: true }),
    enabled,
  });
}
