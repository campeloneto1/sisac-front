"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { permissionsService } from "@/services/permissions/service";
import type { PermissionFilters } from "@/types/permission.type";

export function usePermissionItems(filters: PermissionFilters) {
  return useQuery({
    queryKey: ["permission-items", filters],
    queryFn: () => permissionsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePermissionItem(id: number | string) {
  return useQuery({
    queryKey: ["permission-items", id],
    queryFn: () => permissionsService.show(id),
    enabled: Boolean(id),
  });
}
