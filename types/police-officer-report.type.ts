import type { PaginatedMeta } from "@/types/brand.type";
import type { PoliceOfficerAllocationItem } from "@/types/police-officer-allocation.type";
import type { CourseEnrollmentItem } from "@/types/course-enrollment.type";
import type { PoliceOfficerLeaveItem } from "@/types/police-officer-leave.type";
import type { PoliceOfficerRankItem } from "@/types/police-officer-rank.type";
import type { PoliceOfficerRetirementRequestItem } from "@/types/police-officer-retirement-request.type";
import type { PoliceOfficerVacationItem } from "@/types/police-officer-vacation.type";

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

export interface PoliceOfficerLeaveTypeDurationItem {
  leave_type: {
    id: number | null;
    name: string;
    slug: string | null;
  };
  total_leaves: number;
  total_days: number;
  average_days: number;
  requires_medical_report: boolean | null;
  affects_salary: boolean | null;
}

export interface PoliceOfficerVacationBalanceItem {
  id: number;
  reference_year: number;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
  total_days: number;
  used_days: number;
  sold_days: number;
  remaining_days: number;
  available_days: number;
  valid_from: string | null;
  valid_until: string | null;
  is_expired: boolean;
  police_officer?: PoliceOfficerActiveInactiveItem | null;
}

export interface PoliceOfficerPromotionEligibilityItem {
  id: number;
  name: string | null;
  war_name: string | null;
  registration_number: string | null;
  is_active: boolean;
  eligible_for_promotion: boolean;
  reference_date: string;
  years_in_current_rank: number | null;
  current_rank?: {
    id: number;
    name: string;
    abbreviation: string | null;
    interstice: number | null;
    start_date: string | null;
    minimum_time_completed: boolean | null;
  } | null;
  current_allocation?: {
    sector?: {
      id: number;
      name: string;
      abbreviation: string | null;
    } | null;
    assignment?: {
      id: number;
      name: string;
      category: string | null;
    } | null;
  } | null;
}

export interface PoliceOfficerCourseStatusSummaryItem {
  status: {
    value: string;
    label: string;
    color?: string | null;
  };
  total_registrations: number;
  total_workload_hours: number;
}

export interface PoliceOfficerRetirementStatusSummaryItem {
  status: string;
  total_requests: number;
}

export interface PoliceOfficerFunctionalPanelData {
  officer: PoliceOfficerActiveInactiveItem;
  summary: {
    current_rank?: {
      id: number;
      name: string;
      abbreviation: string | null;
      interstice: number | null;
    } | null;
    eligible_for_promotion: boolean;
    years_in_current_rank: number | null;
    total_allocations: number;
    total_rank_history: number;
    total_leaves: number;
    total_courses: number;
    total_vacations: number;
    total_retirement_requests: number;
  };
  allocations: PoliceOfficerAllocationItem[];
  rank_history: PoliceOfficerRankItem[];
  leaves: PoliceOfficerLeaveItem[];
  courses: CourseEnrollmentItem[];
  vacations: PoliceOfficerVacationItem[];
  retirement_requests: PoliceOfficerRetirementRequestItem[];
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

export type PoliceOfficerLeavesReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerLeaveItem>;

export type PoliceOfficerVacationsOverviewReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerVacationItem>;

export type PoliceOfficerVacationBalancesReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerVacationBalanceItem>;

export type PoliceOfficerAllocationHistoryReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerAllocationItem>;

export type PoliceOfficerPromotionEligibilityReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerPromotionEligibilityItem>;

export type PoliceOfficerPromotionHistoryReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerRankItem>;

export type PoliceOfficerCoursesOverviewReportResponse =
  PaginatedPoliceOfficerReportResponse<CourseEnrollmentItem> & {
    summary?: PoliceOfficerCourseStatusSummaryItem[];
  };

export type PoliceOfficerPendingCertificatesReportResponse =
  PaginatedPoliceOfficerReportResponse<CourseEnrollmentItem>;

export type PoliceOfficerRetirementRequestsReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerRetirementRequestItem> & {
    summary?: PoliceOfficerRetirementStatusSummaryItem[];
  };

export interface PoliceOfficerFunctionalPanelResponse {
  message: string;
  data: PoliceOfficerFunctionalPanelData;
}

export interface PoliceOfficerPhotoBoardItem {
  id: number;
  name: string | null;
  war_name: string | null;
  registration_number: string | null;
  badge_number: string | null;
  profile_photo?: {
    id: number;
    url: string;
  } | null;
  current_rank?: {
    id: number;
    name: string;
    abbreviation: string | null;
    hierarchy_level: number | null;
  } | null;
  current_allocation?: {
    sector?: {
      id: number;
      name: string;
      abbreviation: string | null;
    } | null;
  } | null;
}

export type PoliceOfficerPhotoBoardReportResponse =
  PaginatedPoliceOfficerReportResponse<PoliceOfficerPhotoBoardItem>;
