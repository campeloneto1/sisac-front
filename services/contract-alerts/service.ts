import { api } from "@/lib/api";
import type {
  ContractAlertDeleteResponse,
  ContractAlertFilters,
  ContractAlertListResponse,
  ContractAlertResponse,
  CreateContractAlertDTO,
  UpdateContractAlertDTO,
} from "@/types/contract-alert.type";

export const contractAlertsService = {
  async index(filters: ContractAlertFilters = {}): Promise<ContractAlertListResponse> {
    const { data } = await api.get<ContractAlertListResponse>("/contract-alerts", {
      params: filters,
    });

    return data;
  },
  async create(payload: CreateContractAlertDTO): Promise<ContractAlertResponse> {
    const { data } = await api.post<ContractAlertResponse>("/contract-alerts", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateContractAlertDTO): Promise<ContractAlertResponse> {
    const { data } = await api.put<ContractAlertResponse>(`/contract-alerts/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ContractAlertDeleteResponse> {
    const { data } = await api.delete<ContractAlertDeleteResponse>(`/contract-alerts/${id}`);

    return data;
  },
  async acknowledge(id: number | string): Promise<ContractAlertResponse> {
    const { data } = await api.post<ContractAlertResponse>(`/contract-alerts/${id}/acknowledge`);

    return data;
  },
  async resolve(id: number | string): Promise<ContractAlertResponse> {
    const { data } = await api.post<ContractAlertResponse>(`/contract-alerts/${id}/resolve`);

    return data;
  },
};
