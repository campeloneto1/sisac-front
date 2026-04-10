import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentBatchFilters,
  ArmamentBatchResponse,
  CreateArmamentBatchDTO,
  PaginatedArmamentBatchesResponse,
  UpdateArmamentBatchDTO,
} from "@/types/armament-batch.type";

export const armamentBatchesService = {
  async index(
    filters: ArmamentBatchFilters = {},
  ): Promise<PaginatedArmamentBatchesResponse> {
    const { data } = await api.get<PaginatedArmamentBatchesResponse>(
      "/armament-batches",
      { params: filters },
    );

    return data;
  },

  async show(batchId: number | string): Promise<ArmamentBatchResponse> {
    const { data } = await api.get<ArmamentBatchResponse>(
      `/armament-batches/${batchId}`,
    );

    return data;
  },

  async create(payload: CreateArmamentBatchDTO): Promise<ArmamentBatchResponse> {
    const { data } = await api.post<ArmamentBatchResponse>(
      "/armament-batches",
      payload,
    );

    return data;
  },

  async update(
    batchId: number | string,
    payload: UpdateArmamentBatchDTO,
  ): Promise<ArmamentBatchResponse> {
    const { data } = await api.put<ArmamentBatchResponse>(
      `/armament-batches/${batchId}`,
      payload,
    );

    return data;
  },

  async remove(batchId: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armament-batches/${batchId}`,
    );

    return data;
  },
};
