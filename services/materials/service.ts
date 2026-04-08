import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateMaterialDTO,
  MaterialFilters,
  MaterialResponse,
  PaginatedMaterialsResponse,
  UpdateMaterialDTO,
} from "@/types/material.type";

export const materialsService = {
  async index(filters: MaterialFilters = {}): Promise<PaginatedMaterialsResponse> {
    const { data } = await api.get<PaginatedMaterialsResponse>("/materials", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<MaterialResponse> {
    const { data } = await api.get<MaterialResponse>(`/materials/${id}`);
    return data;
  },

  async create(payload: CreateMaterialDTO): Promise<MaterialResponse> {
    const { data } = await api.post<MaterialResponse>("/materials", payload);
    return data;
  },

  async update(id: number | string, payload: UpdateMaterialDTO): Promise<MaterialResponse> {
    const { data } = await api.put<MaterialResponse>(`/materials/${id}`, payload);
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/materials/${id}`);
    return data;
  },
};
