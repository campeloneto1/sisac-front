import type { ApiMessageResponse } from "@/types/auth.type";
import type { PaginatedResponse } from "@/types/contract.type";

export interface ContractTransactionItem {
  id: number;
  contract_id: number;
  type?: string | null;
  status?: string | null;
  amount?: string | number | null;
  transaction_date?: string | null;
  document_number?: string | null;
  invoice_number?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ContractTransactionFilters {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  status?: string;
}

export interface CreateContractTransactionDTO {
  contract_id: number;
  type?: string | null;
  status?: string | null;
  amount?: number | null;
  transaction_date?: string | null;
  document_number?: string | null;
  invoice_number?: string | null;
  notes?: string | null;
}

export type UpdateContractTransactionDTO = Partial<CreateContractTransactionDTO>;

export interface ContractTransactionResponse {
  message: string;
  data: ContractTransactionItem;
}

export type ContractTransactionListResponse = PaginatedResponse<ContractTransactionItem>;
export type ContractTransactionDeleteResponse = ApiMessageResponse;
