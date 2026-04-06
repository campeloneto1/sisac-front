import type { PaginatedMeta } from "@/types/brand.type";

export interface CountryItem {
  id: number;
  name: string;
  abbreviation: string;
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

export interface CountryFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateCountryDTO {
  name: string;
  abbreviation: string;
}

export interface UpdateCountryDTO {
  name?: string;
  abbreviation?: string;
}

export interface CountryResponse {
  message: string;
  data: CountryItem;
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
