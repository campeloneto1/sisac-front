import type { PaginatedMeta } from "@/types/brand.type";

export interface PoliceOfficerReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  police_officer_id?: number;
  city_id?: number;
  bank_id?: number;
  gender_id?: number;
  education_level_id?: number;
  sector_id?: number;
  assignment_id?: number;
  rank_id?: number;
  leave_type_id?: number;
  course_class_id?: number;
  is_active?: boolean;
  requires_copem?: boolean;
  leave_status?: string;
  vacation_status?: string;
  course_status?: string;
  retirement_status?: string;
  copem_result?: string;
  promotion_type?: string;
  reference_year?: number;
  date_from?: string;
  date_to?: string;
  requested_from?: string;
  requested_to?: string;
  approved_from?: string;
  approved_to?: string;
  published_from?: string;
  published_to?: string;
  vacation_scope?: "all" | "active" | "expired";
}

export interface PoliceOfficerActiveInactiveItem {
  id: number;
  name: string | null;
  war_name: string | null;
  registration_number: string | null;
  badge_number: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  is_active: boolean;
  birth_date: string | null;
  inclusion_date: string | null;
  presentation_date: string | null;
  city?: {
    id: number;
    name: string;
    abbreviation: string | null;
  } | null;
  education_level?: {
    id: number;
    name: string;
  } | null;
  current_rank?: {
    id: number;
    name: string;
    abbreviation: string | null;
    hierarchy_level: number | null;
    start_date: string | null;
    years_in_rank: number | null;
  } | null;
  current_allocation?: {
    id: number;
    start_date: string | null;
    sector?: {
      id: number;
      name: string;
      abbreviation: string | null;
      subunit_id: number | null;
    } | null;
    assignment?: {
      id: number;
      name: string;
      category: string | null;
    } | null;
  } | null;
}

export interface PoliceOfficerActiveInactiveSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface PoliceOfficerEffectiveBySectorItem {
  sector: {
    id: number | null;
    name: string;
    abbreviation: string | null;
  };
  total_officers: number;
  active_officers: number;
  inactive_officers: number;
  assignments: Array<{
    id: number | null;
    name: string;
    category: string | null;
    total_officers: number;
  }>;
  ranks: Array<{
    id: number | null;
    name: string;
    abbreviation: string | null;
    total_officers: number;
  }>;
}

export interface PoliceOfficerRankDistributionItem {
  rank: {
    id: number | null;
    name: string;
    abbreviation: string | null;
    hierarchy_level: number | null;
  };
  total_officers: number;
  active_officers: number;
  inactive_officers: number;
}

export interface PaginatedPoliceOfficerReportResponse<T> {
  message: string;
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
  summary?: PoliceOfficerActiveInactiveSummary;
}

export interface CollectionPoliceOfficerReportResponse<T> {
  message: string;
  data: T[];
}
