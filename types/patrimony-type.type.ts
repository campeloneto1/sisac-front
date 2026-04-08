import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedMeta } from "@/types/brand.type";

export interface PatrimonyTypeItem {
  id: number;
  name: string;
  description?: string | null;
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

export interface PatrimonyTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreatePatrimonyTypeDTO {
  name: string;
  description?: string | null;
}

export type UpdatePatrimonyTypeDTO = Partial<CreatePatrimonyTypeDTO>;

export interface PatrimonyTypeResponse {
  message: string;
  data: PatrimonyTypeItem;
}

export interface PaginatedPatrimonyTypesResponse {
  data: PatrimonyTypeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export type PatrimonyTypeDeleteResponse = ApiMessageResponse;
