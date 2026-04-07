import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedResponse } from "@/types/contract.type";

export interface ContractAmendmentItem {
  id: number;
  contract_id: number;
  amendment_number?: string | null;
  type?: string | null;
  value?: string | number | null;
  percentage?: string | number | null;
  date?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ContractAmendmentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
}

export interface CreateContractAmendmentDTO {
  contract_id: number;
  amendment_number?: string | null;
  type?: string | null;
  value?: number | null;
  percentage?: number | null;
  date?: string | null;
  notes?: string | null;
}

export type UpdateContractAmendmentDTO = Partial<CreateContractAmendmentDTO>;

export interface ContractAmendmentResponse {
  message: string;
  data: ContractAmendmentItem;
}

export type ContractAmendmentListResponse = PaginatedResponse<ContractAmendmentItem>;
export type ContractAmendmentDeleteResponse = ApiMessageResponse;
