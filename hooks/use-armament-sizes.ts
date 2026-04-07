import { useQuery } from "@tanstack/react-query";

import { armamentSizesService } from "@/services/armament-sizes/service";
import type { ArmamentSizeFilters } from "@/types/armament-size.type";

export function useArmamentSizes(filters: ArmamentSizeFilters) {
  return useQuery({
    queryKey: ["armament-sizes", filters],
    queryFn: () => armamentSizesService.index(filters),
  });
}

export function useArmamentSize(id: number | string) {
  return useQuery({
    queryKey: ["armament-sizes", id],
    queryFn: () => armamentSizesService.show(id),
    enabled: Boolean(id),
  });
}
