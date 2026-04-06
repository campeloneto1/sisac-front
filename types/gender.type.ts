import type { PaginatedMeta } from "@/types/brand.type";

export interface GenderItem {
  id: number;
  name: string;
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

export interface GenderFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateGenderDTO {
  name: string;
}

export interface UpdateGenderDTO {
  name?: string;
}

export interface GenderResponse {
  message: string;
  data: GenderItem;
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
