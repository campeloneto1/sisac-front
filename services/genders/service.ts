import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateGenderDTO,
  GenderFilters,
  GenderItem,
  GenderResponse,
  PaginatedResponse,
  UpdateGenderDTO,
} from "@/types/gender.type";

export const gendersService = {
  async index(filters: GenderFilters = {}): Promise<PaginatedResponse<GenderItem>> {
    const { data } = await api.get<PaginatedResponse<GenderItem>>("/genders", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<GenderResponse> {
    const { data } = await api.get<GenderResponse>(`/genders/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateGenderDTO): Promise<GenderResponse> {
    const { data } = await api.post<GenderResponse>("/genders", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateGenderDTO): Promise<GenderResponse> {
    const { data } = await api.put<GenderResponse>(`/genders/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/genders/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
