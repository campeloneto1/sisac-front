import type { PaginatedMeta } from "@/types/brand.type";
import type { PoliceOfficerOption } from "@/types/police-officer.type";
import type { SectorItem } from "@/types/sector.type";
import type { AssignmentItem } from "@/types/assignment.type";

export interface PoliceOfficerAllocationItem {
  id: number;
  police_officer_id: number;
  sector_id: number;
  assignment_id: number;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  police_officer?: PoliceOfficerOption | null;
  sector?: Pick<SectorItem, "id" | "name" | "abbreviation"> | null;
  assignment?: Pick<AssignmentItem, "id" | "name" | "category"> | null;
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

export interface PoliceOfficerAllocationFilters {
  page?: number;
  per_page?: number;
  police_officer_id?: number;
  sector_id?: number;
  assignment_id?: number;
  current_only?: boolean;
}

export interface CreatePoliceOfficerAllocationDTO {
  police_officer_id: number;
  sector_id: number;
  assignment_id: number;
  start_date: string;
  end_date?: string | null;
}

export interface UpdatePoliceOfficerAllocationDTO {
  police_officer_id?: number;
  sector_id?: number;
  assignment_id?: number;
  start_date?: string;
  end_date?: string | null;
}

export interface PoliceOfficerAllocationResponse {
  message: string;
  data: PoliceOfficerAllocationItem;
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
