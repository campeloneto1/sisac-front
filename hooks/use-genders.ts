"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { gendersService } from "@/services/genders/service";
import type { GenderFilters } from "@/types/gender.type";

export function useGenders(filters: GenderFilters) {
  return useQuery({
    queryKey: ["genders", filters],
    queryFn: () => gendersService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useGender(id: number | string) {
  return useQuery({
    queryKey: ["genders", id],
    queryFn: () => gendersService.show(id),
    enabled: Boolean(id),
  });
}
