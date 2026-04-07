import { useQuery } from "@tanstack/react-query";

import { armamentCalibersService } from "@/services/armament-calibers/service";
import type { ArmamentCaliberFilters } from "@/types/armament-caliber.type";

export function useArmamentCalibers(filters: ArmamentCaliberFilters) {
  return useQuery({
    queryKey: ["armament-calibers", filters],
    queryFn: () => armamentCalibersService.index(filters),
  });
}

export function useArmamentCaliber(id: number | string) {
  return useQuery({
    queryKey: ["armament-calibers", id],
    queryFn: () => armamentCalibersService.show(id),
    enabled: Boolean(id),
  });
}
