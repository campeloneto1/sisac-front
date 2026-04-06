"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficerRanksService } from "@/services/police-officer-ranks/service";
import type { PoliceOfficerRankFilters } from "@/types/police-officer-rank.type";

export function usePoliceOfficerRanks(filters: PoliceOfficerRankFilters) {
  return useQuery({
    queryKey: ["police-officer-ranks", filters],
    queryFn: () => policeOfficerRanksService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficerRank(id: number | string) {
  return useQuery({
    queryKey: ["police-officer-ranks", id],
    queryFn: () => policeOfficerRanksService.show(id),
    enabled: Boolean(id),
  });
}
