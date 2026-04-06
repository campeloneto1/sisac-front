import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateRankDTO,
  PaginatedResponse,
  RankFilters,
  RankItem,
  RankResponse,
  UpdateRankDTO,
} from "@/types/rank.type";

export const ranksService = {
  async index(filters: RankFilters = {}): Promise<PaginatedResponse<RankItem>> {
    const { data } = await api.get<PaginatedResponse<RankItem>>("/ranks", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<RankResponse> {
    const { data } = await api.get<RankResponse>(`/ranks/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateRankDTO): Promise<RankResponse> {
    const { data } = await api.post<RankResponse>("/ranks", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateRankDTO): Promise<RankResponse> {
    const { data } = await api.put<RankResponse>(`/ranks/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/ranks/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
