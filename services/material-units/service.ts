import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  MaterialUnitFilters,
  MaterialUnitResponse,
  CreateMaterialUnitDTO,
  PaginatedMaterialUnitsResponse,
  UpdateMaterialUnitDTO,
} from "@/types/material-unit.type";

export const materialUnitsService = {
  async index(
    materialId: number | string,
    filters: MaterialUnitFilters = {},
  ): Promise<PaginatedMaterialUnitsResponse> {
    const { data } = await api.get<PaginatedMaterialUnitsResponse>(
      `/materials/${materialId}/units`,
      { params: filters },
    );

    return data;
  },

  async show(
    materialId: number | string,
    unitId: number | string,
  ): Promise<MaterialUnitResponse> {
    const { data } = await api.get<MaterialUnitResponse>(
      `/materials/${materialId}/units/${unitId}`,
    );

    return data;
  },

  async create(
    materialId: number | string,
    payload: CreateMaterialUnitDTO,
  ): Promise<MaterialUnitResponse> {
    const { data } = await api.post<MaterialUnitResponse>(
      `/materials/${materialId}/units`,
      payload,
    );

    return data;
  },

  async update(
    materialId: number | string,
    unitId: number | string,
    payload: UpdateMaterialUnitDTO,
  ): Promise<MaterialUnitResponse> {
    const { data } = await api.put<MaterialUnitResponse>(
      `/materials/${materialId}/units/${unitId}`,
      payload,
    );

    return data;
  },

  async remove(
    materialId: number | string,
    unitId: number | string,
  ): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/materials/${materialId}/units/${unitId}`,
    );

    return data;
  },
};
