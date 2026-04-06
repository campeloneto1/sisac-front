import type { PaginatedMeta } from "@/types/brand.type";

export interface CourseDisciplineItem {
  id: number;
  course_id: number;
  name: string;
  workload_hours?: number | null;
  order?: number | null;
  course?: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;
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

export interface CourseDisciplineFilters {
  page?: number;
  per_page?: number;
  search?: string;
  course_id?: number | null;
}

export interface CreateCourseDisciplineDTO {
  course_id: number;
  name: string;
  workload_hours?: number | null;
  order?: number | null;
}

export type UpdateCourseDisciplineDTO = Partial<CreateCourseDisciplineDTO>;

export interface CourseDisciplineResponse {
  message: string;
  data: CourseDisciplineItem;
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
