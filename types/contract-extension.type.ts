import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedResponse } from "@/types/contract.type";

export interface ContractExtensionItem {
  id: number;
  contract_id: number;
  extension_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ContractExtensionFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateContractExtensionDTO {
  contract_id: number;
  extension_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
}

export type UpdateContractExtensionDTO = Partial<CreateContractExtensionDTO>;

export interface ContractExtensionResponse {
  message: string;
  data: ContractExtensionItem;
}

export type ContractExtensionListResponse = PaginatedResponse<ContractExtensionItem>;
export type ContractExtensionDeleteResponse = ApiMessageResponse;
