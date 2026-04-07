import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentFilters,
  ArmamentResponse,
  CreateArmamentDTO,
  PaginatedArmamentsResponse,
  UpdateArmamentDTO,
} from "@/types/armament.type";

export const armamentsService = {
  async index(
    filters: ArmamentFilters = {},
  ): Promise<PaginatedArmamentsResponse> {
    const { data } = await api.get<PaginatedArmamentsResponse>("/armaments", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<ArmamentResponse> {
    const { data } = await api.get<ArmamentResponse>(`/armaments/${id}`);
    return data;
  },

  async create(payload: CreateArmamentDTO): Promise<ArmamentResponse> {
    const { data } = await api.post<ArmamentResponse>("/armaments", payload);
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateArmamentDTO,
  ): Promise<ArmamentResponse> {
    const { data } = await api.put<ArmamentResponse>(
      `/armaments/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/armaments/${id}`);
    return data;
  },
};
