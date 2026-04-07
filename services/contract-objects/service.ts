import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ContractObjectFilters,
  ContractObjectItem,
  ContractObjectResponse,
  CreateContractObjectDTO,
  PaginatedResponse,
  UpdateContractObjectDTO,
} from "@/types/contract-object.type";

export const contractObjectsService = {
  async index(filters: ContractObjectFilters = {}): Promise<PaginatedResponse<ContractObjectItem>> {
    const { data } = await api.get<PaginatedResponse<ContractObjectItem>>("/contract-objects", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<ContractObjectResponse> {
    const { data } = await api.get<ContractObjectResponse>(`/contract-objects/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateContractObjectDTO): Promise<ContractObjectResponse> {
    const { data } = await api.post<ContractObjectResponse>("/contract-objects", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateContractObjectDTO): Promise<ContractObjectResponse> {
    const { data } = await api.put<ContractObjectResponse>(`/contract-objects/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/contract-objects/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
