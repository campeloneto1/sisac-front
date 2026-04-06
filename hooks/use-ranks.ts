"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ranksService } from "@/services/ranks/service";
import type { RankFilters } from "@/types/rank.type";

export function useRanks(filters: RankFilters) {
  return useQuery({
    queryKey: ["ranks", filters],
    queryFn: () => ranksService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRank(id: number | string) {
  return useQuery({
    queryKey: ["ranks", id],
    queryFn: () => ranksService.show(id),
    enabled: Boolean(id),
  });
}
