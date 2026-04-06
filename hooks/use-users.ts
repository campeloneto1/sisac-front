"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { usersService } from "@/services/users/service";
import type { UserFilters } from "@/types/user.type";

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: number | string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersService.show(id),
    enabled: Boolean(id),
  });
}

export function useRoles(search?: string) {
  return useQuery({
    queryKey: ["roles", search ?? ""],
    queryFn: () => usersService.roles(search),
  });
}
