import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentSizeFilters,
  ArmamentSizeResponse,
  CreateArmamentSizeDTO,
  PaginatedArmamentSizesResponse,
  UpdateArmamentSizeDTO,
} from "@/types/armament-size.type";

export const armamentSizesService = {
  async index(
    filters: ArmamentSizeFilters = {},
  ): Promise<PaginatedArmamentSizesResponse> {
    const { data } = await api.get<PaginatedArmamentSizesResponse>(
      "/armament-sizes",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ArmamentSizeResponse> {
    const { data } = await api.get<ArmamentSizeResponse>(
      `/armament-sizes/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async create(payload: CreateArmamentSizeDTO): Promise<ArmamentSizeResponse> {
    const { data } = await api.post<ArmamentSizeResponse>(
      "/armament-sizes",
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateArmamentSizeDTO,
  ): Promise<ArmamentSizeResponse> {
    const { data } = await api.put<ArmamentSizeResponse>(
      `/armament-sizes/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armament-sizes/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },
};
