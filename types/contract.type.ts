import type { PaginatedMeta } from "@/types/brand.type";
import type { CompanyItem } from "@/types/company.type";
import type { ContractObjectItem } from "@/types/contract-object.type";
import type { ContractTypeItem } from "@/types/contract-type.type";
import type { SubunitItem } from "@/types/subunit.type";

export const contractStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "expired", label: "Expirado" },
  { value: "suspended", label: "Suspenso" },
  { value: "closed", label: "Encerrado" },
] as const;

export type ContractStatus = (typeof contractStatusOptions)[number]["value"];

export function getContractStatusLabel(status: string) {
  return contractStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function getContractStatusBadgeVariant(status: string): "success" | "danger" | "warning" | "outline" {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "danger";
    case "suspended":
      return "warning";
    default:
      return "outline";
  }
}

export interface ContractRoleAssignee {
  id: number;
  war_name?: string | null;
  registration_number?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface ContractRoleSummary {
  id: number;
  contract_id: number;
  police_officer_id: number | null;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  police_officer?: ContractRoleAssignee | null;
}

export interface ContractTransactionSummary {
  id: number;
  contract_id: number;
  type?: string | null;
  status?: string | null;
  amount?: string | number | null;
  transaction_date?: string | null;
  document_number?: string | null;
  invoice_number?: string | null;
  notes?: string | null;
}

export interface ContractExtensionSummary {
  id: number;
  contract_id: number;
  extension_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

export interface ContractAmendmentSummary {
  id: number;
  contract_id: number;
  amendment_number?: string | null;
  type?: string | null;
  value?: string | number | null;
  percentage?: string | number | null;
  date?: string | null;
  notes?: string | null;
}

export interface ContractAlertSummary {
  id: number;
  contract_id: number;
  type?: string | null;
  status?: string | null;
  message?: string | null;
  alert_date?: string | null;
}

export interface ContractItem {
  id: number;
  subunit_id: number;
  company_id: number;
  contract_type_id: number | null;
  contract_object_id: number | null;
  renewed_from_contract_id: number | null;
  contract_number: string;
  sacc_number: string;
  total_value: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  status_label?: string | null;
  is_extendable: boolean;
  is_active: boolean;
  executed_amount?: string;
  remaining_amount?: string;
  executed_percentage?: number;
  notes?: string | null;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  company?: Pick<CompanyItem, "id" | "name" | "cnpj"> | null;
  contract_type?: Pick<ContractTypeItem, "id" | "name" | "billing_model_label"> | null;
  contract_object?: Pick<ContractObjectItem, "id" | "name" | "description"> | null;
  renewed_from_contract?: Pick<ContractItem, "id" | "contract_number" | "status"> | null;
  renewed_contracts?: Array<Pick<ContractItem, "id" | "contract_number" | "status">>;
  current_manager_role?: ContractRoleSummary | null;
  current_inspector_role?: ContractRoleSummary | null;
  contract_roles?: ContractRoleSummary[];
  contract_extensions?: ContractExtensionSummary[];
  contract_amendments?: ContractAmendmentSummary[];
  contract_transactions?: ContractTransactionSummary[];
  contract_alerts?: ContractAlertSummary[];
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
  deleted_at?: string | null;
}

export interface ContractFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: ContractStatus;
  subunit_id?: number;
  company_id?: number;
  contract_type_id?: number;
  is_active?: boolean;
}

export interface CreateContractDTO {
  subunit_id: number;
  company_id: number;
  contract_type_id?: number | null;
  contract_object_id?: number | null;
  renewed_from_contract_id?: number | null;
  contract_number: string;
  sacc_number: string;
  total_value: number;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  is_extendable?: boolean;
  is_active?: boolean;
  notes?: string | null;
}

export interface UpdateContractDTO {
  subunit_id?: number;
  company_id?: number;
  contract_type_id?: number | null;
  contract_object_id?: number | null;
  renewed_from_contract_id?: number | null;
  contract_number?: string;
  sacc_number?: string;
  total_value?: number;
  start_date?: string;
  end_date?: string;
  status?: ContractStatus;
  is_extendable?: boolean;
  is_active?: boolean;
  notes?: string | null;
}

export interface ContractResponse {
  message: string;
  data: ContractItem;
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
