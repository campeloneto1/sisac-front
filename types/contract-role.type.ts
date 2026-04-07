import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedResponse } from "@/types/contract.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";

export const contractRoleOptions = [
  { value: "manager", label: "Gestor" },
  { value: "inspector", label: "Fiscal" },
  { value: "substitute_manager", label: "Gestor substituto" },
  { value: "substitute_inspector", label: "Fiscal substituto" },
] as const;

export type ContractRoleValue = (typeof contractRoleOptions)[number]["value"];

export interface ContractRoleItem {
  id: number;
  contract_id: number;
  police_officer_id: number | null;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  police_officer?: Pick<PoliceOfficerItem, "id" | "war_name" | "registration_number" | "user"> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ContractRoleFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export interface CreateContractRoleDTO {
  contract_id: number;
  police_officer_id?: number | null;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export type UpdateContractRoleDTO = Partial<CreateContractRoleDTO>;

export interface ContractRoleResponse {
  message: string;
  data: ContractRoleItem;
}

export type ContractRoleListResponse = PaginatedResponse<ContractRoleItem>;
export type ContractRoleDeleteResponse = ApiMessageResponse;

export function getContractRoleLabel(role: string) {
  return contractRoleOptions.find((option) => option.value === role)?.label ?? role;
}
