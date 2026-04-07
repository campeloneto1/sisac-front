import type { PaginatedMeta } from "@/types/brand.type";

export interface ColorItem {
  id: number;
  name: string;
  slug: string;
  hex?: string | null;
  is_active: boolean;
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

export interface ColorFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateColorDTO {
  name: string;
  slug: string;
  hex?: string | null;
  is_active?: boolean;
}

export interface UpdateColorDTO extends Partial<CreateColorDTO> {}

export interface ColorResponse {
  message: string;
  data: ColorItem;
}

export interface PaginatedColorsResponse {
  data: ColorItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
