import { api } from "@/lib/api";
import type {
  ContractAmendmentDeleteResponse,
  ContractAmendmentFilters,
  ContractAmendmentListResponse,
  ContractAmendmentResponse,
  CreateContractAmendmentDTO,
  UpdateContractAmendmentDTO,
} from "@/types/contract-amendment.type";

export const contractAmendmentsService = {
  async index(contractId: number | string, filters: ContractAmendmentFilters = {}): Promise<ContractAmendmentListResponse> {
    const { data } = await api.get<ContractAmendmentListResponse>(`/contracts/${contractId}/amendments`, {
      params: filters,
    });

    return data;
  },
  async create(contractId: number | string, payload: CreateContractAmendmentDTO): Promise<ContractAmendmentResponse> {
    const { data } = await api.post<ContractAmendmentResponse>(`/contracts/${contractId}/amendments`, payload);

    return data;
  },
  async update(
    contractId: number | string,
    id: number | string,
    payload: UpdateContractAmendmentDTO,
  ): Promise<ContractAmendmentResponse> {
    const { data } = await api.put<ContractAmendmentResponse>(`/contracts/${contractId}/amendments/${id}`, payload);

    return data;
  },
  async remove(contractId: number | string, id: number | string): Promise<ContractAmendmentDeleteResponse> {
    const { data } = await api.delete<ContractAmendmentDeleteResponse>(`/contracts/${contractId}/amendments/${id}`);

    return data;
  },
};
