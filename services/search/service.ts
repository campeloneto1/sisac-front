import { api } from "@/lib/api";
import type {
  GlobalSearchFilters,
  GlobalSearchResponse,
} from "@/types/search.type";

export const searchService = {
  async globalSearch(
    filters: GlobalSearchFilters
  ): Promise<GlobalSearchResponse> {
    const { data } = await api.get<GlobalSearchResponse>("/search", {
      params: filters,
    });
    return data;
  },
};
