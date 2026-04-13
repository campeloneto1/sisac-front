import type { PaginatedMeta } from "@/types/brand.type";

export type CourseType = "internal" | "external";

export type CourseEnrollmentStatus =
  | "enrolled"
  | "in_progress"
  | "completed"
  | "failed"
  | "dropped"
  | "cancelled";

export interface CourseEnrollmentItem {
  id: number;
  user_id: number;
  course_id: number;
  course_class_id: number | null;
  enrollment_number: string | null;
  start_date: string | null;
  end_date: string | null;
  certificate_number: string | null;
  certificate_issued_at: string | null;
  certificate_file_path: string | null;
  bulletin: string | null;
  bulletin_date: string | null;
  final_grade: number | null;
  notes: string | null;
  status: CourseEnrollmentStatus;
  status_label: string;
  status_color: string;
  is_internal_course: boolean;
  is_external_course: boolean;
  is_active: boolean;
  is_finished: boolean;
  has_certificate: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    document?: string | null;
  } | null;
  course?: {
    id: number;
    name: string;
    abbreviation: string | null;
    type: CourseType;
    workload: number | null;
  } | null;
  course_class?: {
    id: number;
    name: string | null;
    course_id: number;
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
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CourseEnrollmentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  user_id?: number | null;
  course_id?: number | null;
  course_class_id?: number | null;
  status?: CourseEnrollmentStatus | null;
}

export interface CreateCourseEnrollmentDTO {
  user_id: number;
  course_id: number;
  course_class_id?: number | null;
  enrollment_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  certificate_number?: string | null;
  certificate_issued_at?: string | null;
  certificate_file_path?: string | null;
  bulletin?: string | null;
  bulletin_date?: string | null;
  final_grade?: number | null;
  notes?: string | null;
  status: CourseEnrollmentStatus;
}

export type UpdateCourseEnrollmentDTO = Partial<CreateCourseEnrollmentDTO>;

export interface CourseEnrollmentResponse {
  message: string;
  data: CourseEnrollmentItem;
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

export const COURSE_TYPE_OPTIONS = [
  { value: "internal", label: "Interno", color: "blue" },
  { value: "external", label: "Externo", color: "green" },
] as const;

export const COURSE_ENROLLMENT_STATUS_OPTIONS = [
  { value: "enrolled", label: "Matriculado", color: "blue" },
  { value: "in_progress", label: "Em Andamento", color: "yellow" },
  { value: "completed", label: "Concluído", color: "green" },
  { value: "failed", label: "Reprovado", color: "red" },
  { value: "dropped", label: "Desistente", color: "gray" },
  { value: "cancelled", label: "Cancelado", color: "gray" },
] as const;

export function getCourseTypeLabel(type: CourseType): string {
  const option = COURSE_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.label ?? type;
}

export function getCourseTypeColor(type: CourseType): string {
  const option = COURSE_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.color ?? "gray";
}

export function getCourseEnrollmentStatusLabel(status: CourseEnrollmentStatus): string {
  const option = COURSE_ENROLLMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label ?? status;
}

export function getCourseEnrollmentStatusColor(status: CourseEnrollmentStatus): string {
  const option = COURSE_ENROLLMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color ?? "gray";
}
