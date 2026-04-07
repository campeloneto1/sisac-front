import type { PaginatedMeta } from "@/types/brand.type";

export interface ContractFeatureItem {
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

export interface ContractFeatureFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateContractFeatureDTO {
  name: string;
}

export interface UpdateContractFeatureDTO {
  name?: string;
}

export interface ContractFeatureResponse {
  message: string;
  data: ContractFeatureItem;
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
