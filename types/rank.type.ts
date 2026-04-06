import type { PaginatedMeta } from "@/types/brand.type";

export interface RankItem {
  id: number;
  name: string;
  abbreviation: string;
  hierarchy_level: number;
  interstice: number | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  updater?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RankFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateRankDTO {
  name: string;
  abbreviation: string;
  hierarchy_level: number;
  interstice?: number | null;
}

export interface UpdateRankDTO {
  name?: string;
  abbreviation?: string;
  hierarchy_level?: number;
  interstice?: number | null;
}

export interface RankResponse {
  message: string;
  data: RankItem;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
