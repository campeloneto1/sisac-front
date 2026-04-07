import type { ApiMessageResponse } from "@/types/auth.type";
import type { ContractStatus, PaginatedResponse } from "@/types/contract.type";

export interface ContractStatusHistoryItem {
  id: number;
  contract_id: number;
  old_status?: ContractStatus | null;
  old_status_label?: string | null;
  old_status_color?: string | null;
  new_status: ContractStatus;
  new_status_label?: string | null;
  new_status_color?: string | null;
  reason?: string | null;
  changed_by: number;
  changed_by_user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  changed_at?: string | null;
}

export interface ContractStatusHistoryFilters {
  page?: number;
  per_page?: number;
  contract_id?: number;
  changed_by?: number;
  new_status?: ContractStatus;
  date_from?: string;
  date_to?: string;
}

export interface CreateContractStatusHistoryDTO {
  contract_id: number;
  old_status?: ContractStatus | null;
  new_status: ContractStatus;
  reason?: string | null;
  changed_by: number;
  changed_at: string;
}

export interface ContractStatusHistoryResponse {
  message: string;
  data: ContractStatusHistoryItem;
}

export type ContractStatusHistoryListResponse = PaginatedResponse<ContractStatusHistoryItem>;
export type ContractStatusHistoryDeleteResponse = ApiMessageResponse;
