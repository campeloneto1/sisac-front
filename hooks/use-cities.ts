"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { citiesService } from "@/services/cities/service";
import type { CityFilters } from "@/types/city.type";

export function useCities(filters: CityFilters) {
  return useQuery({
    queryKey: ["cities", filters],
    queryFn: () => citiesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCityItem(id: number | string) {
  return useQuery({
    queryKey: ["cities", id],
    queryFn: () => citiesService.show(id),
    enabled: Boolean(id),
  });
}

export function useCityStates(search?: string) {
  return useQuery({
    queryKey: ["city-states", search ?? ""],
    queryFn: () => citiesService.states(search),
  });
}
