import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentUnitFilters,
  ArmamentUnitResponse,
  CreateArmamentUnitDTO,
  PaginatedArmamentUnitsResponse,
  UpdateArmamentUnitDTO,
} from "@/types/armament-unit.type";

export const armamentUnitsService = {
  async index(
    armamentId: number | string,
    filters: ArmamentUnitFilters = {},
  ): Promise<PaginatedArmamentUnitsResponse> {
    const { data } = await api.get<PaginatedArmamentUnitsResponse>(
      `/armaments/${armamentId}/units`,
      { params: filters },
    );

    return data;
  },

  async show(
    armamentId: number | string,
    unitId: number | string,
  ): Promise<ArmamentUnitResponse> {
    const { data } = await api.get<ArmamentUnitResponse>(
      `/armaments/${armamentId}/units/${unitId}`,
    );

    return data;
  },

  async create(
    armamentId: number | string,
    payload: CreateArmamentUnitDTO,
  ): Promise<ArmamentUnitResponse> {
    const { data } = await api.post<ArmamentUnitResponse>(
      `/armaments/${armamentId}/units`,
      payload,
    );

    return data;
  },

  async update(
    armamentId: number | string,
    unitId: number | string,
    payload: UpdateArmamentUnitDTO,
  ): Promise<ArmamentUnitResponse> {
    const { data } = await api.put<ArmamentUnitResponse>(
      `/armaments/${armamentId}/units/${unitId}`,
      payload,
    );

    return data;
  },

  async remove(
    armamentId: number | string,
    unitId: number | string,
  ): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armaments/${armamentId}/units/${unitId}`,
    );

    return data;
  },
};
