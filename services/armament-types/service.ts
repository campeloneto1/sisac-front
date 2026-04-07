import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentTypeFilters,
  ArmamentTypeResponse,
  CreateArmamentTypeDTO,
  PaginatedArmamentTypesResponse,
  UpdateArmamentTypeDTO,
} from "@/types/armament-type.type";

export const armamentTypesService = {
  async index(
    filters: ArmamentTypeFilters = {},
  ): Promise<PaginatedArmamentTypesResponse> {
    const { data } = await api.get<PaginatedArmamentTypesResponse>(
      "/armament-types",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ArmamentTypeResponse> {
    const { data } = await api.get<ArmamentTypeResponse>(
      `/armament-types/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async create(payload: CreateArmamentTypeDTO): Promise<ArmamentTypeResponse> {
    const { data } = await api.post<ArmamentTypeResponse>(
      "/armament-types",
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateArmamentTypeDTO,
  ): Promise<ArmamentTypeResponse> {
    const { data } = await api.put<ArmamentTypeResponse>(
      `/armament-types/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armament-types/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },
};
