"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { brandsService } from "@/services/brands/service";
import type { BrandFilters } from "@/types/brand.type";

export function useBrands(filters: BrandFilters) {
  return useQuery({
    queryKey: ["brands", filters],
    queryFn: () => brandsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useBrand(id: number | string) {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => brandsService.show(id),
    enabled: Boolean(id),
  });
}
