import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { armamentsService } from "@/services/armaments/service";
import type { ArmamentFilters } from "@/types/armament.type";

export function useArmaments(filters: ArmamentFilters) {
  return useQuery({
    queryKey: ["armaments", filters],
    queryFn: () => armamentsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useArmament(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["armaments", id],
    queryFn: () => armamentsService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
