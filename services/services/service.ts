import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateServiceDTO,
  PaginatedServicesResponse,
  ServiceFilters,
  ServiceResponse,
  UpdateServiceDTO,
} from "@/types/service.type";

export const servicesService = {
  async index(filters: ServiceFilters = {}): Promise<PaginatedServicesResponse> {
    const { data } = await api.get<PaginatedServicesResponse>("/services", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<ServiceResponse> {
    const { data } = await api.get<ServiceResponse>(`/services/${id}`);
    return data;
  },

  async create(payload: CreateServiceDTO): Promise<ServiceResponse> {
    const { data } = await api.post<ServiceResponse>("/services", payload);
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateServiceDTO,
  ): Promise<ServiceResponse> {
    const { data } = await api.put<ServiceResponse>(`/services/${id}`, payload);
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/services/${id}`);
    return data;
  },
};
