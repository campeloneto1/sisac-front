import type { PaginatedMeta } from "@/types/brand.type";

export interface LeaveTypeItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  requires_medical_report: boolean;
  affects_salary: boolean;
  max_days?: number | null;
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

export interface LeaveTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
  requires_medical_report?: boolean;
  affects_salary?: boolean;
}

export interface CreateLeaveTypeDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
  requires_medical_report?: boolean;
  affects_salary?: boolean;
  max_days?: number | null;
}

export interface UpdateLeaveTypeDTO {
  name?: string;
  slug?: string | null;
  description?: string | null;
  requires_medical_report?: boolean;
  affects_salary?: boolean;
  max_days?: number | null;
}

export interface LeaveTypeResponse {
  message: string;
  data: LeaveTypeItem;
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
