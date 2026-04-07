"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { colorsService } from "@/services/colors/service";
import type { ColorFilters } from "@/types/color.type";

export function useColors(filters: ColorFilters) {
  return useQuery({
    queryKey: ["colors", filters],
    queryFn: () => colorsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useColor(id: number | string) {
  return useQuery({
    queryKey: ["colors", id],
    queryFn: () => colorsService.show(id),
    enabled: Boolean(id),
  });
}
