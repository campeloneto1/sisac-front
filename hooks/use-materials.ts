"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { materialsService } from "@/services/materials/service";
import type { MaterialFilters } from "@/types/material.type";

export function useMaterials(filters: MaterialFilters, enabled = true) {
  return useQuery({
    queryKey: ["materials", filters],
    queryFn: () => materialsService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMaterial(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["materials", id],
    queryFn: () => materialsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
