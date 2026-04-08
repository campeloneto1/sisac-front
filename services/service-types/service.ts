import { api } from "@/lib/api";
import type {
  CreateServiceTypeDTO,
  PaginatedServiceTypesResponse,
  ServiceTypeDeleteResponse,
  ServiceTypeFilters,
  ServiceTypeResponse,
  UpdateServiceTypeDTO,
} from "@/types/service-type.type";

export const serviceTypesService = {
  async index(
    filters: ServiceTypeFilters = {},
  ): Promise<PaginatedServiceTypesResponse> {
    const { data } = await api.get<PaginatedServiceTypesResponse>(
      "/service-types",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ServiceTypeResponse> {
    const { data } = await api.get<ServiceTypeResponse>(`/service-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },

  async create(payload: CreateServiceTypeDTO): Promise<ServiceTypeResponse> {
    const { data } = await api.post<ServiceTypeResponse>(
      "/service-types",
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateServiceTypeDTO,
  ): Promise<ServiceTypeResponse> {
    const { data } = await api.put<ServiceTypeResponse>(
      `/service-types/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async remove(id: number | string): Promise<ServiceTypeDeleteResponse> {
    const { data } = await api.delete<ServiceTypeDeleteResponse>(
      `/service-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },
};
