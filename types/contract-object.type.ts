import type { PaginatedMeta } from "@/types/brand.type";

export interface ContractObjectItem {
  id: number;
  name: string;
  description?: string | null;
  contracts_count?: number;
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

export interface ContractObjectFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateContractObjectDTO {
  name: string;
  description?: string | null;
}

export interface UpdateContractObjectDTO {
  name?: string;
  description?: string | null;
}

export interface ContractObjectResponse {
  message: string;
  data: ContractObjectItem;
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
