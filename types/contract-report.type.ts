import type { PaginatedMeta } from "@/types/brand.type";

export interface ContractReportFilters {
  page?: number;
  per_page?: number;
  search?: string;
  contract_id?: number;
  company_id?: number;
  contract_type_id?: number;
  contract_object_id?: number;
  status?: "active" | "expired" | "suspended" | "closed";
  transaction_type?: "commitment" | "liquidation" | "payment";
  transaction_status?: "pending" | "approved" | "cancelled";
  alert_status?: "pending" | "acknowledged" | "resolved";
  alert_type?:
    | "budget_70_percent"
    | "budget_80_percent"
    | "budget_90_percent"
    | "budget_95_percent"
    | "budget_100_percent"
    | "expiration_6_months"
    | "expiration_3_months"
    | "expiration_2_months"
    | "expiration_1_month"
    | "expiration_15_days"
    | "expiration_10_days"
    | "expiration_5_days";
  old_status?: "active" | "expired" | "suspended" | "closed";
  new_status?: "active" | "expired" | "suspended" | "closed";
  is_active?: boolean;
  only_expiring?: boolean;
  start_from?: string;
  start_to?: string;
  end_from?: string;
  end_to?: string;
  transaction_from?: string;
  transaction_to?: string;
  alert_from?: string;
  alert_to?: string;
  changed_from?: string;
  changed_to?: string;
  min_total_value?: number;
  max_total_value?: number;
  expiring_in_days?: number;
}

export interface ContractReportSummary {
  id: number;
  contract_number: string;
  sacc_number?: string | null;
  total_value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_extendable: boolean;
  is_active: boolean;
  executed_amount?: number | null;
  remaining_amount?: number | null;
  executed_percentage?: number | null;
  status?: { value: string; label: string; color?: string | null } | null;
  subunit?: { id: number; name: string; abbreviation?: string | null } | null;
  company?: { id: number; name: string } | null;
  contract_type?: { id: number; name: string } | null;
  contract_object?: { id: number; name: string; description?: string | null } | null;
}

export interface ContractStatusOverviewItem {
  status: { value: string; label: string; color?: string | null };
  total_contracts: number;
  total_value?: number | null;
  executed_amount?: number | null;
}

export interface ContractExecutionOverviewItem {
  company: { id: number | null; name: string };
  total_contracts: number;
  total_value?: number | null;
  executed_amount?: number | null;
  remaining_amount?: number | null;
  executed_percentage?: number | null;
}

export interface ContractExpiringItem {
  contract: ContractReportSummary;
  days_until_end?: number | null;
}

export interface ContractTransactionReportItem {
  id: number;
  amount?: number | null;
  transaction_date?: string | null;
  document_number?: string | null;
  invoice_number?: string | null;
  notes?: string | null;
  type?: { value: string; label: string } | null;
  status?: { value: string; label: string; color?: string | null } | null;
  contract?: {
    id: number;
    contract_number: string;
    company?: { id: number; name: string } | null;
    subunit?: { id: number; name: string; abbreviation?: string | null } | null;
  } | null;
}

export interface ContractAlertReportItem {
  id: number;
  message: string;
  alert_date?: string | null;
  type?: {
    value: string;
    label: string;
    color?: string | null;
    priority?: number | null;
    percentage_threshold?: number | null;
  } | null;
  status?: { value: string; label: string; color?: string | null } | null;
  contract?: {
    id: number;
    contract_number: string;
    company?: { id: number; name: string } | null;
  } | null;
  acknowledged_by?: { id: number; name: string; email?: string | null } | null;
  resolved_by?: { id: number; name: string; email?: string | null } | null;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
}

export interface ContractStatusChangeReportItem {
  id: number;
  reason?: string | null;
  changed_at?: string | null;
  old_status?: { value: string; label: string; color?: string | null } | null;
  new_status?: { value: string; label: string; color?: string | null } | null;
  contract?: {
    id: number;
    contract_number: string;
    company?: { id: number; name: string } | null;
  } | null;
  changed_by?: { id: number; name: string; email?: string | null } | null;
}

export interface ContractPanelData {
  contract: ContractReportSummary;
  summary: {
    total_extensions: number;
    total_amendments: number;
    total_transactions: number;
    total_alerts: number;
    pending_alerts: number;
    total_status_changes: number;
    executed_amount?: number | null;
    remaining_amount?: number | null;
    executed_percentage?: number | null;
  };
  current_manager_role?: {
    id: number;
    role?: string | null;
    police_officer?: {
      id: number;
      war_name?: string | null;
      registration_number?: string | null;
      user?: { id: number; name: string; email?: string | null } | null;
    } | null;
  } | null;
  current_inspector_role?: {
    id: number;
    role?: string | null;
    police_officer?: {
      id: number;
      war_name?: string | null;
      registration_number?: string | null;
      user?: { id: number; name: string; email?: string | null } | null;
    } | null;
  } | null;
  renewed_contracts?: ContractReportSummary[];
  contract_roles?: Array<{ id: number; role?: string | null; is_active?: boolean; start_date?: string | null; end_date?: string | null }>;
  contract_extensions?: Array<{ id: number; extension_number?: string | null; start_date?: string | null; end_date?: string | null; notes?: string | null }>;
  contract_amendments?: Array<{ id: number; amendment_number?: string | null; type?: string | null; value?: number | string | null; percentage?: number | string | null; date?: string | null; notes?: string | null }>;
  contract_transactions?: Array<{ id: number; type?: string | null; status?: string | null; amount?: number | string | null; transaction_date?: string | null }>;
  contract_alerts?: Array<{ id: number; type?: string | null; type_label?: string | null; status?: string | null; status_label?: string | null; message?: string | null; alert_date?: string | null }>;
  contract_status_histories?: Array<{ id: number; old_status?: string | null; new_status?: string | null; changed_at?: string | null; reason?: string | null }>;
}

export interface CollectionContractReportResponse<T> {
  message: string;
  data: T[];
}

export interface PaginatedContractReportResponse<T> {
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

export interface ContractPanelResponse {
  message: string;
  data: ContractPanelData;
}
