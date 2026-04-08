"use client";

import { useQuery } from "@tanstack/react-query";

import { homeService } from "@/services/home/service";

export function useHome(enabled = true) {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => homeService.index(),
    enabled,
  });
}
