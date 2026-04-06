import type { PaginatedMeta } from "@/types/brand.type";

export interface PoliceOfficerCourseItem {
  id: number;
  workload_hours?: number | null;
  bulletin?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  certificate_issued_at?: string | null;
  certificate_file_path?: string | null;
  can_receive_certificate?: boolean;
  police_officer?: {
    id: number;
    user_id?: number | null;
    name?: string | null;
    war_name?: string | null;
    registration_number?: string | null;
    user?: {
      id: number;
      name: string;
    } | null;
  } | null;
  police_officer_id: number;
  course_class?: {
    id: number;
    course_id?: number | null;
    name?: string | null;
    status?: string | null;
    course?: {
      id: number;
      name: string;
      abbreviation?: string | null;
    } | null;
  } | null;
  course_class_id: number;
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

export interface PoliceOfficerCourseFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  police_officer_id?: number | null;
  course_class_id?: number | null;
}

export interface CreatePoliceOfficerCourseDTO {
  police_officer_id: number;
  course_class_id: number;
  workload_hours?: number | null;
  bulletin?: string | null;
  start_date: string;
  end_date?: string | null;
  status?: string | null;
}

export type UpdatePoliceOfficerCourseDTO = Partial<CreatePoliceOfficerCourseDTO>;

export interface PoliceOfficerCourseResponse {
  message: string;
  data: PoliceOfficerCourseItem;
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

export const POLICE_OFFICER_COURSE_STATUS_OPTIONS = [
  { value: "enrolled", label: "Inscrito" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluido" },
  { value: "failed", label: "Reprovado" },
  { value: "dropped", label: "Desistente" },
  { value: "cancelled", label: "Cancelado" },
] as const;
