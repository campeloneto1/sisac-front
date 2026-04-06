"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { countriesService } from "@/services/countries/service";
import type { CountryFilters } from "@/types/country.type";

export function useCountries(filters: CountryFilters) {
  return useQuery({
    queryKey: ["countries", filters],
    queryFn: () => countriesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCountry(id: number | string) {
  return useQuery({
    queryKey: ["countries", id],
    queryFn: () => countriesService.show(id),
    enabled: Boolean(id),
  });
}
