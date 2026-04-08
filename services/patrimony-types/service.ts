import { api } from "@/lib/api";
import type {
  CreatePatrimonyTypeDTO,
  PaginatedPatrimonyTypesResponse,
  PatrimonyTypeDeleteResponse,
  PatrimonyTypeFilters,
  PatrimonyTypeResponse,
  UpdatePatrimonyTypeDTO,
} from "@/types/patrimony-type.type";

export const patrimonyTypesService = {
  async index(
    filters: PatrimonyTypeFilters = {},
  ): Promise<PaginatedPatrimonyTypesResponse> {
    const { data } = await api.get<PaginatedPatrimonyTypesResponse>(
      "/patrimony-types",
      {
        params: filters,
        skipSubunit: true,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<PatrimonyTypeResponse> {
    const { data } = await api.get<PatrimonyTypeResponse>(
      `/patrimony-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async create(
    payload: CreatePatrimonyTypeDTO,
  ): Promise<PatrimonyTypeResponse> {
    const { data } = await api.post<PatrimonyTypeResponse>(
      "/patrimony-types",
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async update(
    id: number | string,
    payload: UpdatePatrimonyTypeDTO,
  ): Promise<PatrimonyTypeResponse> {
    const { data } = await api.put<PatrimonyTypeResponse>(
      `/patrimony-types/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async remove(id: number | string): Promise<PatrimonyTypeDeleteResponse> {
    const { data } = await api.delete<PatrimonyTypeDeleteResponse>(
      `/patrimony-types/${id}`,
      {
        skipSubunit: true,
      },
    );

    return data;
  },
};
