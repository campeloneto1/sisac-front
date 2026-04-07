import { api } from "@/lib/api";
import type {
  ContractRoleDeleteResponse,
  ContractRoleFilters,
  ContractRoleListResponse,
  ContractRoleResponse,
  CreateContractRoleDTO,
  UpdateContractRoleDTO,
} from "@/types/contract-role.type";

export const contractRolesService = {
  async index(contractId: number | string, filters: ContractRoleFilters = {}): Promise<ContractRoleListResponse> {
    const { data } = await api.get<ContractRoleListResponse>(`/contracts/${contractId}/roles`, {
      params: filters,
    });

    return data;
  },
  async create(contractId: number | string, payload: CreateContractRoleDTO): Promise<ContractRoleResponse> {
    const { data } = await api.post<ContractRoleResponse>(`/contracts/${contractId}/roles`, payload);

    return data;
  },
  async update(
    contractId: number | string,
    id: number | string,
    payload: UpdateContractRoleDTO,
  ): Promise<ContractRoleResponse> {
    const { data } = await api.put<ContractRoleResponse>(`/contracts/${contractId}/roles/${id}`, payload);

    return data;
  },
  async remove(contractId: number | string, id: number | string): Promise<ContractRoleDeleteResponse> {
    const { data } = await api.delete<ContractRoleDeleteResponse>(`/contracts/${contractId}/roles/${id}`);

    return data;
  },
};
