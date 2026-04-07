import type { PaginatedMeta } from "@/types/brand.type";

export interface ArmamentTypeItem {
  id: number;
  name: string;
  slug: string;
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
  deleted_at?: string | null;
}

export interface ArmamentTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateArmamentTypeDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
}

export type UpdateArmamentTypeDTO = Partial<CreateArmamentTypeDTO>;

export interface ArmamentTypeResponse {
  message: string;
  data: ArmamentTypeItem;
}

export interface PaginatedArmamentTypesResponse {
  data: ArmamentTypeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
