"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { rolesService } from "@/services/roles/service";
import type { RoleFilters } from "@/types/role.type";

export function useRoles(filters: RoleFilters) {
  return useQuery({
    queryKey: ["roles", filters],
    queryFn: () => rolesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRole(id: number | string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => rolesService.show(id),
    enabled: Boolean(id),
  });
}

export function usePermissionOptions(search?: string) {
  return useQuery({
    queryKey: ["permissions", search ?? ""],
    queryFn: () => rolesService.permissions(search),
  });
}
