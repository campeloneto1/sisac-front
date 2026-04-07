import { api } from "@/lib/api";
import type {
  ContractExtensionDeleteResponse,
  ContractExtensionFilters,
  ContractExtensionListResponse,
  ContractExtensionResponse,
  CreateContractExtensionDTO,
  UpdateContractExtensionDTO,
} from "@/types/contract-extension.type";

export const contractExtensionsService = {
  async index(contractId: number | string, filters: ContractExtensionFilters = {}): Promise<ContractExtensionListResponse> {
    const { data } = await api.get<ContractExtensionListResponse>(`/contracts/${contractId}/extensions`, {
      params: filters,
    });

    return data;
  },
  async create(contractId: number | string, payload: CreateContractExtensionDTO): Promise<ContractExtensionResponse> {
    const { data } = await api.post<ContractExtensionResponse>(`/contracts/${contractId}/extensions`, payload);

    return data;
  },
  async update(
    contractId: number | string,
    id: number | string,
    payload: UpdateContractExtensionDTO,
  ): Promise<ContractExtensionResponse> {
    const { data } = await api.put<ContractExtensionResponse>(`/contracts/${contractId}/extensions/${id}`, payload);

    return data;
  },
  async remove(contractId: number | string, id: number | string): Promise<ContractExtensionDeleteResponse> {
    const { data } = await api.delete<ContractExtensionDeleteResponse>(`/contracts/${contractId}/extensions/${id}`);

    return data;
  },
};
