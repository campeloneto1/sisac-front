import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateEducationLevelDTO,
  EducationLevelFilters,
  EducationLevelItem,
  EducationLevelResponse,
  PaginatedResponse,
  UpdateEducationLevelDTO,
} from "@/types/education-level.type";

export const educationLevelsService = {
  async index(filters: EducationLevelFilters = {}): Promise<PaginatedResponse<EducationLevelItem>> {
    const { data } = await api.get<PaginatedResponse<EducationLevelItem>>("/education-levels", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<EducationLevelResponse> {
    const { data } = await api.get<EducationLevelResponse>(`/education-levels/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateEducationLevelDTO): Promise<EducationLevelResponse> {
    const { data } = await api.post<EducationLevelResponse>("/education-levels", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateEducationLevelDTO): Promise<EducationLevelResponse> {
    const { data } = await api.put<EducationLevelResponse>(`/education-levels/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/education-levels/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
