import { api } from "@/lib/api";
import type {
  CreateServiceStatusHistoryDTO,
  PaginatedServiceStatusHistoryResponse,
  ServiceStatusHistoryFilters,
  ServiceStatusHistoryResponse,
  UpdateServiceStatusHistoryDTO,
  ServiceStatusHistoryDeleteResponse,
} from "@/types/service-status-history.type";

export const serviceStatusHistoriesService = {
  async index(
    filters: ServiceStatusHistoryFilters = {},
  ): Promise<PaginatedServiceStatusHistoryResponse> {
    const { data } = await api.get<PaginatedServiceStatusHistoryResponse>(
      "/service-status-history",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ServiceStatusHistoryResponse> {
    const { data } = await api.get<ServiceStatusHistoryResponse>(
      `/service-status-history/${id}`,
    );

    return data;
  },

  async create(
    payload: CreateServiceStatusHistoryDTO,
  ): Promise<ServiceStatusHistoryResponse> {
    const { data } = await api.post<ServiceStatusHistoryResponse>(
      "/service-status-history",
      payload,
    );

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateServiceStatusHistoryDTO,
  ): Promise<ServiceStatusHistoryResponse> {
    const { data } = await api.put<ServiceStatusHistoryResponse>(
      `/service-status-history/${id}`,
      payload,
    );

    return data;
  },

  async remove(
    id: number | string,
  ): Promise<ServiceStatusHistoryDeleteResponse> {
    const { data } = await api.delete<ServiceStatusHistoryDeleteResponse>(
      `/service-status-history/${id}`,
    );

    return data;
  },
};
