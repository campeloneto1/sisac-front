import type { PaginatedMeta } from "@/types/user.type";
import type { Subunit } from "@/types/subunit.type";

export interface UserSubunitItem {
  id: number;
  user_id: number;
  subunit_id: number;
  subunit?: Subunit | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserSubunitFilters {
  page?: number;
  per_page?: number;
  user_id?: number;
  subunit_id?: number;
}

export interface CreateUserSubunitDTO {
  user_id: number;
  subunit_id: number;
}

export interface UserSubunitResponse {
  message: string;
  data: UserSubunitItem;
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

export interface SubunitListResponse {
  data: Subunit[];
  meta: PaginatedMeta;
}
