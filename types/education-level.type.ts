import type { PaginatedMeta } from "@/types/brand.type";

export interface EducationLevelItem {
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

export interface EducationLevelFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateEducationLevelDTO {
  name: string;
}

export interface UpdateEducationLevelDTO {
  name?: string;
}

export interface EducationLevelResponse {
  message: string;
  data: EducationLevelItem;
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
