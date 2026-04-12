import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedMeta } from "@/types/brand.type";

export type MaterialControlType = "unit" | "batch";

export interface MaterialTypeItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  control_type: MaterialControlType;
  control_type_label: string;
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

export interface MaterialTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateMaterialTypeDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
  control_type: MaterialControlType;
}

export type UpdateMaterialTypeDTO = Partial<CreateMaterialTypeDTO>;

export interface MaterialTypeResponse {
  message: string;
  data: MaterialTypeItem;
}

export interface PaginatedMaterialTypesResponse {
  data: MaterialTypeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export type MaterialTypeDeleteResponse = ApiMessageResponse;
