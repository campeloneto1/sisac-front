"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { patrimoniesService } from "@/services/patrimonies/service";
import type { PatrimonyFilters } from "@/types/patrimony.type";

export function usePatrimonies(filters: PatrimonyFilters, enabled = true) {
  return useQuery({
    queryKey: ["patrimonies", filters],
    queryFn: () => patrimoniesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePatrimony(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["patrimonies", id],
    queryFn: () => patrimoniesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}

export function usePatrimonyHistory(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["patrimonies", id, "history"],
    queryFn: () => patrimoniesService.history(id),
    enabled: Boolean(id) && enabled,
  });
}
