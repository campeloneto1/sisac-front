import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  MaterialBatchFilters,
  MaterialBatchResponse,
  CreateMaterialBatchDTO,
  PaginatedMaterialBatchesResponse,
  UpdateMaterialBatchDTO,
} from "@/types/material-batch.type";

export const materialBatchesService = {
  async index(
    filters: MaterialBatchFilters = {},
  ): Promise<PaginatedMaterialBatchesResponse> {
    const { data } = await api.get<PaginatedMaterialBatchesResponse>(
      "/material-batches",
      { params: filters },
    );

    return data;
  },

  async show(batchId: number | string): Promise<MaterialBatchResponse> {
    const { data } = await api.get<MaterialBatchResponse>(
      `/material-batches/${batchId}`,
    );

    return data;
  },

  async create(payload: CreateMaterialBatchDTO): Promise<MaterialBatchResponse> {
    const { data } = await api.post<MaterialBatchResponse>(
      "/material-batches",
      payload,
    );

    return data;
  },

  async update(
    batchId: number | string,
    payload: UpdateMaterialBatchDTO,
  ): Promise<MaterialBatchResponse> {
    const { data } = await api.put<MaterialBatchResponse>(
      `/material-batches/${batchId}`,
      payload,
    );

    return data;
  },

  async remove(batchId: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/material-batches/${batchId}`,
    );

    return data;
  },
};
