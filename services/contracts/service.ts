import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ContractFilters,
  ContractItem,
  ContractResponse,
  CreateContractDTO,
  PaginatedResponse,
  UpdateContractDTO,
} from "@/types/contract.type";

export const contractsService = {
  async index(filters: ContractFilters = {}): Promise<PaginatedResponse<ContractItem>> {
    const { data } = await api.get<PaginatedResponse<ContractItem>>("/contracts", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<ContractResponse> {
    const { data } = await api.get<ContractResponse>(`/contracts/${id}`);

    return data;
  },
  async create(payload: CreateContractDTO): Promise<ContractResponse> {
    const { data } = await api.post<ContractResponse>("/contracts", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateContractDTO): Promise<ContractResponse> {
    const { data } = await api.put<ContractResponse>(`/contracts/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/contracts/${id}`);

    return data;
  },
};
