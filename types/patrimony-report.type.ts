import type { PaginatedMeta } from "@/types/brand.type";

export interface PatrimonyReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  patrimony_id?: number;
  patrimony_type_id?: number;
  current_sector_id?: number;
  from_sector_id?: number;
  to_sector_id?: number;
  status?: "active" | "returned" | "disposed";
  supplier?: string;
  date_from?: string;
  date_to?: string;
  disposed_from?: string;
  disposed_to?: string;
  transferred_from?: string;
  transferred_to?: string;
  min_acquisition_value?: number;
  max_acquisition_value?: number;
}

export interface PatrimonyReportSummary {
  id: number;
  code: string;
  serial_number?: string | null;
  description?: string | null;
  acquisition_date?: string | null;
  acquisition_value?: number | null;
  supplier?: string | null;
  invoice_number?: string | null;
  disposed_at?: string | null;
  disposed_reason?: string | null;
  disposed_protocol?: string | null;
  status?: { value: string; label: string; color?: string | null } | null;
  patrimony_type?: { id: number; name: string } | null;
  current_sector?: { id: number; name: string; abbreviation?: string | null; subunit_id?: number | null } | null;
}

export interface PatrimonyStatusOverviewItem {
  status: { value: string; label: string; color?: string | null };
  total_patrimonies: number;
  total_acquisition_value?: number | null;
}

export interface PatrimonyTypeDistributionItem {
  patrimony_type: { id: number; name: string };
  total_patrimonies: number;
  active_patrimonies: number;
  written_off_patrimonies: number;
  total_acquisition_value?: number | null;
}

export interface PatrimonySectorDistributionItem {
  sector: { id: number; name: string; abbreviation?: string | null };
  total_patrimonies: number;
  total_acquisition_value?: number | null;
}

export interface PatrimonyMovementReportItem {
  id: number;
  patrimony?: {
    id: number;
    code: string;
    serial_number?: string | null;
    description?: string | null;
    status?: { value: string; label: string; color?: string | null } | null;
    patrimony_type?: { id: number; name: string } | null;
  } | null;
  from_sector?: { id: number; name: string; abbreviation?: string | null; subunit_id?: number | null } | null;
  to_sector?: { id: number; name: string; abbreviation?: string | null; subunit_id?: number | null } | null;
  transferred_at?: string | null;
  reason?: string | null;
  transferred_by?: { id: number; name: string; email?: string | null } | null;
}

export interface PatrimonyAcquisitionCostItem {
  patrimony_type: { id: number; name: string };
  total_patrimonies: number;
  total_acquisition_value?: number | null;
  average_acquisition_value?: number | null;
  min_acquisition_value?: number | null;
  max_acquisition_value?: number | null;
}

export interface PatrimonyPanelData {
  patrimony: PatrimonyReportSummary;
  summary: {
    total_movements: number;
    first_transfer_at?: string | null;
    last_transfer_at?: string | null;
  };
  movements: PatrimonyMovementReportItem[];
}

export interface CollectionPatrimonyReportResponse<T> {
  message: string;
  data: T[];
}

export interface PaginatedPatrimonyReportResponse<T> {
  message: string;
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export interface PatrimonyPanelResponse {
  message: string;
  data: PatrimonyPanelData;
}
