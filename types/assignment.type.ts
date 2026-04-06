import type { PaginatedMeta } from "@/types/brand.type";

export interface AssignmentItem {
  id: number;
  name: string;
  category?: string | null;
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

export interface AssignmentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
}

export interface CreateAssignmentDTO {
  name: string;
  category?: string | null;
}

export interface UpdateAssignmentDTO {
  name?: string;
  category?: string | null;
}

export interface AssignmentResponse {
  message: string;
  data: AssignmentItem;
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
