import type { PaginatedMeta } from "@/types/brand.type";

export interface ArmamentCaliberItem {
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

export interface ArmamentCaliberFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateArmamentCaliberDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
}

export type UpdateArmamentCaliberDTO = Partial<CreateArmamentCaliberDTO>;

export interface ArmamentCaliberResponse {
  message: string;
  data: ArmamentCaliberItem;
}

export interface PaginatedArmamentCalibersResponse {
  data: ArmamentCaliberItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
