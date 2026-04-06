import type { PaginatedMeta } from "@/types/brand.type";
import type { CityItem } from "@/types/city.type";

export interface UnitOfficerOption {
  id: number;
  name?: string | null;
  registration_number?: string | null;
}

export interface UnitItem {
  id: number;
  name: string;
  abbreviation: string;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  city_id: number | null;
  commander_id: number | null;
  deputy_commander_id: number | null;
  city?: Pick<CityItem, "id" | "name" | "abbreviation"> | null;
  commander?: UnitOfficerOption | null;
  deputy_commander?: UnitOfficerOption | null;
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

export interface UnitFilters {
  page?: number;
  per_page?: number;
  search?: string;
  city_id?: number | null;
}

export interface CreateUnitDTO {
  name: string;
  abbreviation: string;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  city_id?: number | null;
  commander_id?: number | null;
  deputy_commander_id?: number | null;
}

export interface UpdateUnitDTO {
  name?: string;
  abbreviation?: string;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  city_id?: number | null;
  commander_id?: number | null;
  deputy_commander_id?: number | null;
}

export interface UnitResponse {
  message: string;
  data: UnitItem;
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

export interface UnitCityListResponse {
  data: Pick<CityItem, "id" | "name" | "abbreviation">[];
  meta: PaginatedMeta;
}

export interface UnitOfficerListResponse {
  data: UnitOfficerOption[];
  meta: PaginatedMeta;
}
