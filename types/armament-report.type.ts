import type { PaginatedMeta } from "@/types/brand.type";
import type { ArmamentLoanRecord } from "@/types/armament-loan.type";

export interface ArmamentReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  armament_id?: number;
  armament_type_id?: number;
  control_type?: "unit" | "batch";
  variant_id?: number;
  armament_caliber_id?: number;
  armament_size_id?: number;
  gender_id?: number;
  police_officer_id?: number;
  kind?: "temporary" | "cautela";
  loan_status?: "open" | "partial" | "returned" | "overdue";
  unit_status?: "available" | "loaned" | "assigned" | "maintenance" | "discharged" | "lost";
  occurrence_type?: "loss" | "damage" | "discharge" | "theft";
  occurrence_status?: "reported" | "investigating" | "resolved" | "closed";
  movement_type?: "entry" | "exit" | "loan" | "return" | "assignment" | "unassignment" | "discharge" | "loss" | "adjustment";
  only_active?: boolean;
  only_overdue?: boolean;
  only_critical?: boolean;
  expiring_in_days?: number;
  date_from?: string;
  date_to?: string;
  loaned_from?: string;
  loaned_to?: string;
  occurred_from?: string;
  occurred_to?: string;
  moved_from?: string;
  moved_to?: string;
}

export interface ArmamentReportArmamentSummary {
  id: number;
  specifications?: Record<string, string> | null;
  subunit?: { id: number; name: string; abbreviation?: string | null } | null;
  type?: { id: number; name: string; slug?: string | null } | null;
  variant?: {
    id: number;
    name: string;
    abbreviation?: string | null;
    brand?: { id: number; name: string; type?: string | null } | null;
  } | null;
  caliber?: { id: number; name: string; slug?: string | null } | null;
  size?: { id: number; name: string; slug?: string | null } | null;
  gender?: { id: number; name: string } | null;
}

export interface ArmamentInventoryItem {
  armament: {
    id: number;
    type?: string | null;
    variant?: string | null;
    caliber?: string | null;
    size?: string | null;
  };
  total_units: number;
  available_units: number;
  loaned_units: number;
  assigned_units: number;
  maintenance_units: number;
  discharged_units: number;
  lost_units: number;
  total_batches_quantity: number;
  available_batches_quantity: number;
}

export interface ArmamentAvailabilityItem {
  status: string;
  label: string;
  total_units: number;
  color?: string | null;
}

export interface ArmamentUnitReportItem {
  id: number;
  serial_number?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
  is_expired: boolean;
  is_expiring_soon: boolean;
  armament?: ArmamentReportArmamentSummary | null;
}

export interface ArmamentBatchReportItem {
  id: number;
  batch_number?: string | null;
  quantity: number;
  used_quantity: number;
  available_quantity: number;
  available_percentage: number;
  usage_percentage: number;
  expiration_date?: string | null;
  is_expired: boolean;
  is_expiring_soon: boolean;
  armament?: ArmamentReportArmamentSummary | null;
}

export interface ArmamentMovementReportItem {
  id: number;
  type?: {
    value: string;
    label: string;
    increments_stock: boolean;
    affects_stock: boolean;
  } | null;
  quantity: number;
  moved_at?: string | null;
  notes?: string | null;
  armament?: ArmamentReportArmamentSummary | null;
  unit?: { id: number; serial_number?: string | null; status?: string | null } | null;
  batch?: { id: number; batch_number?: string | null } | null;
  reference?: { type?: string | null; id?: number | null } | null;
  authorized_by?: { id: number; name: string; email?: string | null } | null;
}

export interface ArmamentOccurrenceReportItem {
  id: number;
  type?: {
    value: string;
    label: string;
    severity: "low" | "medium" | "high" | "critical";
    requires_police_report: boolean;
  } | null;
  occurred_at?: string | null;
  report_number?: string | null;
  has_police_report: boolean;
  description?: string | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
    is_active: boolean;
  } | null;
  days_since_occurred?: number | null;
  armament?: ArmamentReportArmamentSummary | null;
  unit?: { id: number; serial_number?: string | null } | null;
  batch?: { id: number; batch_number?: string | null } | null;
  reported_by?: { id: number; name: string; email?: string | null } | null;
}

export interface ArmamentOccurrenceSummaryItem {
  type?: {
    value: string;
    label: string;
    severity: "low" | "medium" | "high" | "critical";
    requires_police_report: boolean;
  } | null;
  status?: { value: string; label: string; color?: string | null } | null;
  total_occurrences: number;
}

export interface ArmamentPanelData {
  armament: ArmamentReportArmamentSummary;
  summary: {
    total_units: number;
    available_units: number;
    loaned_units: number;
    assigned_units: number;
    maintenance_units: number;
    lost_units: number;
    total_batches: number;
    total_batch_quantity: number;
    available_batch_quantity: number;
    total_movements: number;
    total_occurrences: number;
    active_occurrences: number;
    total_loans: number;
  };
  units: ArmamentUnitReportItem[];
  batches: ArmamentBatchReportItem[];
  movements: ArmamentMovementReportItem[];
  occurrences: ArmamentOccurrenceReportItem[];
  loans: ArmamentLoanRecord[];
}

export interface CollectionArmamentReportResponse<T> {
  message: string;
  data: T[];
}

export interface PaginatedArmamentReportResponse<T> {
  message: string;
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
  summary?: ArmamentOccurrenceSummaryItem[];
}

export interface ArmamentPanelResponse {
  message: string;
  data: ArmamentPanelData;
}

export type ArmamentUnitsReportResponse = PaginatedArmamentReportResponse<ArmamentUnitReportItem>;
export type ArmamentBatchesReportResponse = PaginatedArmamentReportResponse<ArmamentBatchReportItem>;
export type ArmamentLoansReportResponse = PaginatedArmamentReportResponse<ArmamentLoanRecord>;
export type ArmamentMovementsReportResponse = PaginatedArmamentReportResponse<ArmamentMovementReportItem>;
export type ArmamentOccurrencesReportResponse = PaginatedArmamentReportResponse<ArmamentOccurrenceReportItem> & {
  summary?: ArmamentOccurrenceSummaryItem[];
};
