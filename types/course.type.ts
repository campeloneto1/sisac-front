import type { PaginatedMeta } from "@/types/brand.type";

export interface CourseItem {
  id: number;
  name: string;
  abbreviation: string;
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

export interface CourseFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateCourseDTO {
  name: string;
  abbreviation: string;
}

export type UpdateCourseDTO = Partial<CreateCourseDTO>;

export interface CourseResponse {
  message: string;
  data: CourseItem;
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
