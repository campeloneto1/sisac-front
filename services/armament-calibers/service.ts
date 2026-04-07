import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentCaliberFilters,
  ArmamentCaliberResponse,
  CreateArmamentCaliberDTO,
  PaginatedArmamentCalibersResponse,
  UpdateArmamentCaliberDTO,
} from "@/types/armament-caliber.type";

export const armamentCalibersService = {
  async index(
    filters: ArmamentCaliberFilters = {},
  ): Promise<PaginatedArmamentCalibersResponse> {
    const { data } = await api.get<PaginatedArmamentCalibersResponse>(
      "/armament-calibers",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ArmamentCaliberResponse> {
    const { data } = await api.get<ArmamentCaliberResponse>(
      `/armament-calibers/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async create(
    payload: CreateArmamentCaliberDTO,
  ): Promise<ArmamentCaliberResponse> {
    const { data } = await api.post<ArmamentCaliberResponse>(
      "/armament-calibers",
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateArmamentCaliberDTO,
  ): Promise<ArmamentCaliberResponse> {
    const { data } = await api.put<ArmamentCaliberResponse>(
      `/armament-calibers/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armament-calibers/${id}`,
      {
        skipSubunit: true,
      },
    );
    return data;
  },
};
