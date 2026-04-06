import type { PaginatedMeta } from "@/types/brand.type";

export interface PublicationTypeItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_positive?: boolean;
  generates_points?: boolean;
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

export interface PublicationTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
  is_positive?: boolean;
  generates_points?: boolean;
}

export interface CreatePublicationTypeDTO {
  name: string;
  slug: string;
  description?: string | null;
  is_positive?: boolean;
  generates_points?: boolean;
}

export type UpdatePublicationTypeDTO = Partial<CreatePublicationTypeDTO>;

export interface PublicationTypeResponse {
  message: string;
  data: PublicationTypeItem;
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
