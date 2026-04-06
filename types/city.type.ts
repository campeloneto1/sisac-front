import type { PaginatedMeta } from "@/types/brand.type";
import type { CountryItem } from "@/types/country.type";

export interface CityStateOption {
  id: number;
  name: string;
  abbreviation: string;
  country_id: number | null;
  country?: Pick<CountryItem, "id" | "name" | "abbreviation"> | null;
}

export interface CityItem {
  id: number;
  name: string;
  abbreviation?: string | null;
  state_id: number | null;
  state?: CityStateOption | null;
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

export interface CityFilters {
  page?: number;
  per_page?: number;
  search?: string;
  state_id?: number | null;
}

export interface CreateCityDTO {
  name: string;
  abbreviation?: string | null;
  state_id?: number | null;
}

export interface UpdateCityDTO {
  name?: string;
  abbreviation?: string | null;
  state_id?: number | null;
}

export interface CityResponse {
  message: string;
  data: CityItem;
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

export interface CityStateListResponse {
  data: CityStateOption[];
  meta: PaginatedMeta;
}
