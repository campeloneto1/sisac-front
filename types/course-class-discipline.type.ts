import type { PaginatedMeta } from "@/types/brand.type";

export interface CourseClassDisciplineItem {
  id: number;
  course_class_id: number;
  name: string;
  workload_hours?: number | null;
  instructor_id?: number | null;
  order?: number | null;
  course_class?: {
    id: number;
    name?: string | null;
    status?: string | null;
    course_id: number;
  } | null;
  instructor?: {
    id: number;
    name: string;
    email: string;
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

export interface CourseClassDisciplineFilters {
  page?: number;
  per_page?: number;
  search?: string;
  course_class_id?: number | null;
  instructor_id?: number | null;
}

export interface CreateCourseClassDisciplineDTO {
  course_class_id: number;
  name: string;
  workload_hours?: number | null;
  instructor_id?: number | null;
  order?: number | null;
}

export type UpdateCourseClassDisciplineDTO = Partial<CreateCourseClassDisciplineDTO>;

export interface CourseClassDisciplineResponse {
  message: string;
  data: CourseClassDisciplineItem;
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
