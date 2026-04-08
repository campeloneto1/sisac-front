import { api } from "@/lib/api";
import type {
  CreateMaterialTypeDTO,
  MaterialTypeDeleteResponse,
  MaterialTypeFilters,
  MaterialTypeResponse,
  PaginatedMaterialTypesResponse,
  UpdateMaterialTypeDTO,
} from "@/types/material-type.type";

export const materialTypesService = {
  async index(
    filters: MaterialTypeFilters = {},
  ): Promise<PaginatedMaterialTypesResponse> {
    const { data } = await api.get<PaginatedMaterialTypesResponse>(
      "/material-types",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<MaterialTypeResponse> {
    const { data } = await api.get<MaterialTypeResponse>(
      `/material-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async create(payload: CreateMaterialTypeDTO): Promise<MaterialTypeResponse> {
    const { data } = await api.post<MaterialTypeResponse>(
      "/material-types",
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateMaterialTypeDTO,
  ): Promise<MaterialTypeResponse> {
    const { data } = await api.put<MaterialTypeResponse>(
      `/material-types/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async remove(id: number | string): Promise<MaterialTypeDeleteResponse> {
    const { data } = await api.delete<MaterialTypeDeleteResponse>(
      `/material-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },
};
