import type { PaginatedMeta } from "@/types/brand.type";
import type { Subunit } from "@/types/subunit.type";
import type { UnitOfficerOption } from "@/types/unit.type";

export interface SectorItem {
  id: number;
  name: string;
  abbreviation: string | null;
  phone: string | null;
  email: string | null;
  subunit_id: number | null;
  commander_id: number | null;
  deputy_commander_id: number | null;
  subunit?: Pick<Subunit, "id" | "name" | "abbreviation"> | null;
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

export interface SectorFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateSectorDTO {
  name: string;
  abbreviation?: string | null;
  phone?: string | null;
  email?: string | null;
  subunit_id?: number | null;
  commander_id?: number | null;
  deputy_commander_id?: number | null;
}

export interface UpdateSectorDTO {
  name?: string;
  abbreviation?: string | null;
  phone?: string | null;
  email?: string | null;
  subunit_id?: number | null;
  commander_id?: number | null;
  deputy_commander_id?: number | null;
}

export interface SectorResponse {
  message: string;
  data: SectorItem;
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

export interface SectorOfficerListResponse {
  data: UnitOfficerOption[];
  meta: PaginatedMeta;
}
