import { api } from "@/lib/api";
import type {
  ContractStatusHistoryFilters,
  ContractStatusHistoryListResponse,
  ContractStatusHistoryResponse,
  CreateContractStatusHistoryDTO,
} from "@/types/contract-status-history.type";

export const contractStatusHistoriesService = {
  async index(filters: ContractStatusHistoryFilters = {}): Promise<ContractStatusHistoryListResponse> {
    const { data } = await api.get<ContractStatusHistoryListResponse>("/contract-status-histories", {
      params: filters,
    });

    return data;
  },
  async create(payload: CreateContractStatusHistoryDTO): Promise<ContractStatusHistoryResponse> {
    const { data } = await api.post<ContractStatusHistoryResponse>("/contract-status-histories", payload);

    return data;
  },
};
