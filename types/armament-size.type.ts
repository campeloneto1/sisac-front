import type { PaginatedMeta } from "@/types/brand.type";

export interface ArmamentSizeItem {
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

export interface ArmamentSizeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateArmamentSizeDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
}

export type UpdateArmamentSizeDTO = Partial<CreateArmamentSizeDTO>;

export interface ArmamentSizeResponse {
  message: string;
  data: ArmamentSizeItem;
}

export interface PaginatedArmamentSizesResponse {
  data: ArmamentSizeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
