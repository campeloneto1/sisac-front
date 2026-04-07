import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedResponse } from "@/types/contract.type";

export const contractAlertTypeOptions = [
  { value: "budget_70_percent", label: "Execucao financeira em 70%" },
  { value: "budget_80_percent", label: "Execucao financeira em 80%" },
  { value: "budget_90_percent", label: "Execucao financeira em 90%" },
  { value: "budget_95_percent", label: "Execucao financeira em 95%" },
  { value: "budget_100_percent", label: "Execucao financeira em 100%" },
  { value: "expiration_6_months", label: "Vencimento em 6 meses" },
  { value: "expiration_3_months", label: "Vencimento em 3 meses" },
  { value: "expiration_2_months", label: "Vencimento em 2 meses" },
  { value: "expiration_1_month", label: "Vencimento em 1 mes" },
  { value: "expiration_15_days", label: "Vencimento em 15 dias" },
  { value: "expiration_10_days", label: "Vencimento em 10 dias" },
  { value: "expiration_5_days", label: "Vencimento em 5 dias" },
] as const;

export const contractAlertStatusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "acknowledged", label: "Reconhecido" },
  { value: "resolved", label: "Resolvido" },
] as const;

export type ContractAlertType = (typeof contractAlertTypeOptions)[number]["value"];
export type ContractAlertStatus = (typeof contractAlertStatusOptions)[number]["value"];

export interface ContractAlertItem {
  id: number;
  contract_id: number;
  type?: ContractAlertType | null;
  type_label?: string | null;
  type_color?: string | null;
  type_priority?: number | null;
  status?: ContractAlertStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  message: string;
  alert_date?: string | null;
  acknowledged_by?: number | null;
  acknowledged_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  acknowledged_at?: string | null;
  resolved_by?: number | null;
  resolved_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  resolved_at?: string | null;
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

export interface ContractAlertFilters {
  page?: number;
  per_page?: number;
  contract_id?: number;
  type?: ContractAlertType;
  status?: ContractAlertStatus;
  search?: string;
}

export interface CreateContractAlertDTO {
  contract_id: number;
  type: ContractAlertType;
  status?: ContractAlertStatus | null;
  message: string;
  alert_date: string;
}

export type UpdateContractAlertDTO = Partial<CreateContractAlertDTO>;

export interface ContractAlertResponse {
  message: string;
  data: ContractAlertItem;
}

export type ContractAlertListResponse = PaginatedResponse<ContractAlertItem>;
export type ContractAlertDeleteResponse = ApiMessageResponse;

export function getContractAlertTypeLabel(value?: string | null) {
  return contractAlertTypeOptions.find((option) => option.value === value)?.label ?? "Tipo nao informado";
}

export function getContractAlertStatusLabel(value?: string | null) {
  return contractAlertStatusOptions.find((option) => option.value === value)?.label ?? "Status nao informado";
}

export function getContractAlertBadgeVariant(color?: string | null): "danger" | "warning" | "info" | "success" | "outline" {
  switch (color) {
    case "red":
      return "danger";
    case "orange":
    case "yellow":
      return "warning";
    case "blue":
      return "info";
    case "green":
      return "success";
    default:
      return "outline";
  }
}
