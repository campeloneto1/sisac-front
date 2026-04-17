import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search/service";
import type { GlobalSearchFilters } from "@/types/search.type";

export function useGlobalSearch(filters: GlobalSearchFilters) {
  const { query, limit, modules } = filters;

  return useQuery({
    queryKey: ["global-search", { query, limit, modules }],
    queryFn: () => searchService.globalSearch(filters),
    enabled: query.length >= 3, // Só executa se tiver pelo menos 3 caracteres
    staleTime: 120000, // 2 minutos (mesmo TTL do cache da API)
  });
}
