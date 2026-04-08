import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedMeta } from "@/types/brand.type";

export interface ServiceTypeItem {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  requires_approval: boolean;
  estimated_duration_hours?: number | null;
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

export interface ServiceTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
  active?: boolean | null;
  requires_approval?: boolean | null;
}

export interface CreateServiceTypeDTO {
  name: string;
  code: string;
  description?: string | null;
  active?: boolean;
  requires_approval?: boolean;
  estimated_duration_hours?: number | null;
}

export type UpdateServiceTypeDTO = Partial<CreateServiceTypeDTO>;

export interface ServiceTypeResponse {
  message: string;
  data: ServiceTypeItem;
}

export interface PaginatedServiceTypesResponse {
  data: ServiceTypeItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export type ServiceTypeDeleteResponse = ApiMessageResponse;
