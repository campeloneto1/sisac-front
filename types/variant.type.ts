import type { BrandItem, PaginatedMeta } from "@/types/brand.type";

export interface VariantItem {
  id: number;
  name: string;
  abbreviation: string | null;
  brand_id: number | null;
  brand?: Pick<BrandItem, "id" | "name" | "abbreviation" | "type"> | null;
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

export interface VariantFilters {
  page?: number;
  per_page?: number;
  search?: string;
  brand_id?: number | null;
}

export interface CreateVariantDTO {
  name: string;
  abbreviation?: string | null;
  brand_id?: number | null;
}

export interface UpdateVariantDTO {
  name?: string;
  abbreviation?: string | null;
  brand_id?: number | null;
}

export interface VariantResponse {
  message: string;
  data: VariantItem;
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

export interface BrandOption {
  id: number;
  name: string;
  abbreviation: string | null;
  type: BrandItem["type"];
}

export interface BrandListResponse {
  data: BrandOption[];
  meta: PaginatedMeta;
}
