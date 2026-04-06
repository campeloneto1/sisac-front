"use client";

import { useQuery } from "@tanstack/react-query";

import { userSubunitsService } from "@/services/user-subunits/service";

export function useUserSubunits(userId?: number) {
  return useQuery({
    queryKey: ["user-subunits", userId],
    queryFn: () => userSubunitsService.index({ user_id: userId, per_page: 100 }),
    enabled: Boolean(userId),
  });
}

export function useUserSubunitOptions(search?: string) {
  return useQuery({
    queryKey: ["user-subunit-options", search ?? ""],
    queryFn: () => userSubunitsService.subunits(search),
  });
}
