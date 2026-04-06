import type { PaginatedMeta } from "@/types/brand.type";

export interface CourseClassDisciplineItem {
  id: number;
  course_class_id: number;
  name: string;
  workload_hours?: number | null;
  order?: number | null;
  instructor?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CourseClassItem {
  id: number;
  name?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  disciplines?: CourseClassDisciplineItem[];
  course_id: number;
  course?: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;
  authorizer?: {
    id: number;
    name: string;
    email: string;
  } | null;
  authorizer_id?: number | null;
  coordinator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  coordinator_id?: number | null;
  monitor?: {
    id: number;
    name: string;
    email: string;
  } | null;
  monitor_id?: number | null;
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

export interface CourseClassFilters {
  page?: number;
  per_page?: number;
  search?: string;
  course_id?: number | null;
  status?: string;
}

export interface CreateCourseClassDTO {
  course_id: number;
  name?: string | null;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  authorized_by?: number | null;
  coordinator_id?: number | null;
  monitor_id?: number | null;
}

export type UpdateCourseClassDTO = Partial<CreateCourseClassDTO>;

export interface CourseClassResponse {
  message: string;
  data: CourseClassItem;
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

export const COURSE_CLASS_STATUS_OPTIONS = [
  { value: "planned", label: "Planejada" },
  { value: "ongoing", label: "Em andamento" },
  { value: "completed", label: "Concluida" },
  { value: "cancelled", label: "Cancelada" },
] as const;
