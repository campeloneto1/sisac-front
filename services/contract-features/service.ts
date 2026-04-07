import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ContractFeatureFilters,
  ContractFeatureItem,
  ContractFeatureResponse,
  CreateContractFeatureDTO,
  PaginatedResponse,
  UpdateContractFeatureDTO,
} from "@/types/contract-feature.type";

export const contractFeaturesService = {
  async index(filters: ContractFeatureFilters = {}): Promise<PaginatedResponse<ContractFeatureItem>> {
    const { data } = await api.get<PaginatedResponse<ContractFeatureItem>>("/contract-features", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<ContractFeatureResponse> {
    const { data } = await api.get<ContractFeatureResponse>(`/contract-features/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateContractFeatureDTO): Promise<ContractFeatureResponse> {
    const { data } = await api.post<ContractFeatureResponse>("/contract-features", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateContractFeatureDTO): Promise<ContractFeatureResponse> {
    const { data } = await api.put<ContractFeatureResponse>(`/contract-features/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/contract-features/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
