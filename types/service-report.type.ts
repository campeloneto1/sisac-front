import type { PaginatedMeta } from "@/types/brand.type";

export interface ServiceReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  service_id?: number;
  company_id?: number;
  service_type_id?: number;
  contract_id?: number;
  requested_by?: number;
  sector_id?: number;
  changed_by?: number;
  status?: "solicitado" | "aprovado" | "agendado" | "em_andamento" | "pausado" | "concluido" | "cancelado" | "abandonado";
  priority?: "baixa" | "media" | "alta" | "urgente";
  from_status?: "solicitado" | "aprovado" | "agendado" | "em_andamento" | "pausado" | "concluido" | "cancelado" | "abandonado";
  to_status?: "solicitado" | "aprovado" | "agendado" | "em_andamento" | "pausado" | "concluido" | "cancelado" | "abandonado";
  only_overdue?: boolean;
  scheduled_from?: string;
  scheduled_to?: string;
  requested_from?: string;
  requested_to?: string;
  started_from?: string;
  started_to?: string;
  finished_from?: string;
  finished_to?: string;
  changed_from?: string;
  changed_to?: string;
  min_estimated_cost?: number;
  max_estimated_cost?: number;
  min_actual_cost?: number;
  max_actual_cost?: number;
  rating?: number;
}

export interface ServiceReportSummary {
  id: number;
  request_description?: string | null;
  location?: string | null;
  requested_at?: string | null;
  scheduled_date?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  rating?: number | null;
  status?: { value: string; label: string; color?: string | null } | null;
  priority?: { value: string; label: string; color?: string | null } | null;
  company?: { id: number; name: string } | null;
  service_type?: { id: number; name: string; code?: string | null } | null;
  contract?: { id: number; contract_number?: string | null } | null;
  requester?: { id: number; name: string; email?: string | null } | null;
  sector?: { id: number; name: string; abbreviation?: string | null; subunit_id?: number | null } | null;
}

export interface ServiceStatusOverviewItem {
  status: { value: string; label: string; color?: string | null };
  total_services: number;
  estimated_cost?: number | null;
  actual_cost?: number | null;
}

export interface ServicePriorityOverviewItem {
  priority?: { value: string; label: string; color?: string | null } | null;
  fallback_label?: string | null;
  total_services: number;
  open_services: number;
}

export interface ServiceByTypeItem {
  service_type: { id: number; name: string; code?: string | null };
  total_services: number;
  completed_services: number;
  cancelled_services: number;
  estimated_cost?: number | null;
  actual_cost?: number | null;
}

export interface ServiceCompletionItem {
  service: ServiceReportSummary;
  finish_observations?: string | null;
  rating_comment?: string | null;
}

export interface ServiceCostSummaryItem {
  company: { id: number; name: string };
  total_services: number;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  average_estimated_cost?: number | null;
  average_actual_cost?: number | null;
}

export interface ServiceStatusChangeItem {
  id: number;
  service_id: number;
  service?: {
    id: number;
    request_description?: string | null;
    company?: { id: number; name: string } | null;
    service_type?: { id: number; name: string; code?: string | null } | null;
    sector?: { id: number; name: string; abbreviation?: string | null; subunit_id?: number | null } | null;
  } | null;
  from_status?: { value: string; label: string; color?: string | null } | null;
  to_status?: { value: string; label: string; color?: string | null } | null;
  notes?: string | null;
  changed_by?: { id: number; name: string; email?: string | null } | null;
  changed_at?: string | null;
}

export interface ServicePanelData {
  service: ServiceReportSummary;
  summary: {
    total_status_changes: number;
    latest_status_change_at?: string | null;
    estimated_cost?: number | null;
    actual_cost?: number | null;
    rating?: number | null;
  };
  status_history: ServiceStatusChangeItem[];
}

export interface CollectionServiceReportResponse<T> {
  message: string;
  data: T[];
}

export interface PaginatedServiceReportResponse<T> {
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

export interface ServicePanelResponse {
  message: string;
  data: ServicePanelData;
}
