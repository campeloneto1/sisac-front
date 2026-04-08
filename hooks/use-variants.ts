"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { variantsService } from "@/services/variants/service";
import type { VariantFilters } from "@/types/variant.type";

export function useVariants(filters: VariantFilters, enabled = true) {
  return useQuery({
    queryKey: ["variants", filters],
    queryFn: () => variantsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useVariant(id: number | string) {
  return useQuery({
    queryKey: ["variants", id],
    queryFn: () => variantsService.show(id),
    enabled: Boolean(id),
  });
}

export function useVariantBrands(search?: string) {
  return useQuery({
    queryKey: ["variant-brands", search ?? ""],
    queryFn: () => variantsService.brands(search),
  });
}
