"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { patrimonyTypesService } from "@/services/patrimony-types/service";
import type { PatrimonyTypeFilters } from "@/types/patrimony-type.type";

export function usePatrimonyTypes(filters: PatrimonyTypeFilters) {
  return useQuery({
    queryKey: ["patrimony-types", filters],
    queryFn: () => patrimonyTypesService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePatrimonyType(id: number | string) {
  return useQuery({
    queryKey: ["patrimony-types", id],
    queryFn: () => patrimonyTypesService.show(id),
    enabled: Boolean(id),
  });
}
