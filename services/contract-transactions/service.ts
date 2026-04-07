import { api } from "@/lib/api";
import type {
  ContractTransactionDeleteResponse,
  ContractTransactionFilters,
  ContractTransactionListResponse,
  ContractTransactionResponse,
  CreateContractTransactionDTO,
  UpdateContractTransactionDTO,
} from "@/types/contract-transaction.type";

export const contractTransactionsService = {
  async index(contractId: number | string, filters: ContractTransactionFilters = {}): Promise<ContractTransactionListResponse> {
    const { data } = await api.get<ContractTransactionListResponse>(`/contracts/${contractId}/transactions`, {
      params: filters,
    });

    return data;
  },
  async create(
    contractId: number | string,
    payload: CreateContractTransactionDTO,
  ): Promise<ContractTransactionResponse> {
    const { data } = await api.post<ContractTransactionResponse>(`/contracts/${contractId}/transactions`, payload);

    return data;
  },
  async update(
    contractId: number | string,
    id: number | string,
    payload: UpdateContractTransactionDTO,
  ): Promise<ContractTransactionResponse> {
    const { data } = await api.put<ContractTransactionResponse>(`/contracts/${contractId}/transactions/${id}`, payload);

    return data;
  },
  async remove(contractId: number | string, id: number | string): Promise<ContractTransactionDeleteResponse> {
    const { data } = await api.delete<ContractTransactionDeleteResponse>(`/contracts/${contractId}/transactions/${id}`);

    return data;
  },
};
