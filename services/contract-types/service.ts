import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ContractTypeFilters,
  ContractTypeItem,
  ContractTypeResponse,
  CreateContractTypeDTO,
  PaginatedResponse,
  UpdateContractTypeDTO,
} from "@/types/contract-type.type";

export const contractTypesService = {
  async index(filters: ContractTypeFilters = {}): Promise<PaginatedResponse<ContractTypeItem>> {
    const { data } = await api.get<PaginatedResponse<ContractTypeItem>>("/contract-types", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<ContractTypeResponse> {
    const { data } = await api.get<ContractTypeResponse>(`/contract-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateContractTypeDTO): Promise<ContractTypeResponse> {
    const { data } = await api.post<ContractTypeResponse>("/contract-types", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateContractTypeDTO): Promise<ContractTypeResponse> {
    const { data } = await api.put<ContractTypeResponse>(`/contract-types/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/contract-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
