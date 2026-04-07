"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { workshopsService } from "@/services/workshops/service";
import type { WorkshopFilters } from "@/types/workshop.type";

export function useWorkshops(filters: WorkshopFilters) {
  return useQuery({
    queryKey: ["workshops", filters],
    queryFn: () => workshopsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useWorkshop(id: number | string) {
  return useQuery({
    queryKey: ["workshops", id],
    queryFn: () => workshopsService.show(id),
    enabled: Boolean(id),
  });
}
