import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePatrimonyDTO,
  DisposePatrimonyDTO,
  PaginatedPatrimoniesResponse,
  PatrimonyFilters,
  PatrimonyHistoryResponse,
  PatrimonyResponse,
  TransferPatrimonyDTO,
  UpdatePatrimonyDTO,
} from "@/types/patrimony.type";

export const patrimoniesService = {
  async index(
    filters: PatrimonyFilters = {},
  ): Promise<PaginatedPatrimoniesResponse> {
    const { data } = await api.get<PaginatedPatrimoniesResponse>("/patrimonies", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<PatrimonyResponse> {
    const { data } = await api.get<PatrimonyResponse>(`/patrimonies/${id}`);
    return data;
  },

  async create(payload: CreatePatrimonyDTO): Promise<PatrimonyResponse> {
    const { data } = await api.post<PatrimonyResponse>("/patrimonies", payload);
    return data;
  },

  async update(
    id: number | string,
    payload: UpdatePatrimonyDTO,
  ): Promise<PatrimonyResponse> {
    const { data } = await api.put<PatrimonyResponse>(`/patrimonies/${id}`, payload);
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/patrimonies/${id}`);
    return data;
  },

  async transfer(
    id: number | string,
    payload: TransferPatrimonyDTO,
  ): Promise<PatrimonyResponse> {
    const { data } = await api.post<PatrimonyResponse>(
      `/patrimonies/${id}/transfer`,
      payload,
    );
    return data;
  },

  async dispose(
    id: number | string,
    payload: DisposePatrimonyDTO,
  ): Promise<PatrimonyResponse> {
    const { data } = await api.post<PatrimonyResponse>(
      `/patrimonies/${id}/dispose`,
      payload,
    );
    return data;
  },

  async history(id: number | string): Promise<PatrimonyHistoryResponse> {
    const { data } = await api.get<PatrimonyHistoryResponse>(`/patrimonies/${id}/history`);
    return data;
  },
};
