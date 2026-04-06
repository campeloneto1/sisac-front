import type { PaginatedMeta } from "@/types/brand.type";
import type { CountryItem } from "@/types/country.type";

export interface StateItem {
  id: number;
  name: string;
  abbreviation: string;
  country_id: number | null;
  country?: Pick<CountryItem, "id" | "name" | "abbreviation"> | null;
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

export interface StateFilters {
  page?: number;
  per_page?: number;
  search?: string;
  country_id?: number | null;
}

export interface CreateStateDTO {
  name: string;
  abbreviation: string;
  country_id?: number | null;
}

export interface UpdateStateDTO {
  name?: string;
  abbreviation?: string;
  country_id?: number | null;
}

export interface StateResponse {
  message: string;
  data: StateItem;
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

export interface CountryOption {
  id: number;
  name: string;
  abbreviation: string;
}

export interface CountryListResponse {
  data: CountryOption[];
  meta: PaginatedMeta;
}
