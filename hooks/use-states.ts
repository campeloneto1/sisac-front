"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { statesService } from "@/services/states/service";
import type { StateFilters } from "@/types/state.type";

export function useStates(filters: StateFilters) {
  return useQuery({
    queryKey: ["states", filters],
    queryFn: () => statesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useStateItem(id: number | string) {
  return useQuery({
    queryKey: ["states", id],
    queryFn: () => statesService.show(id),
    enabled: Boolean(id),
  });
}

export function useStateCountries(search?: string) {
  return useQuery({
    queryKey: ["state-countries", search ?? ""],
    queryFn: () => statesService.countries(search),
  });
}
