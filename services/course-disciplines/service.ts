import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CourseDisciplineFilters,
  CourseDisciplineItem,
  CourseDisciplineResponse,
  CreateCourseDisciplineDTO,
  PaginatedResponse,
  UpdateCourseDisciplineDTO,
} from "@/types/course-discipline.type";

export const courseDisciplinesService = {
  async index(filters: CourseDisciplineFilters = {}): Promise<PaginatedResponse<CourseDisciplineItem>> {
    const { data } = await api.get<PaginatedResponse<CourseDisciplineItem>>("/course-disciplines", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<CourseDisciplineResponse> {
    const { data } = await api.get<CourseDisciplineResponse>(`/course-disciplines/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateCourseDisciplineDTO): Promise<CourseDisciplineResponse> {
    const { data } = await api.post<CourseDisciplineResponse>("/course-disciplines", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateCourseDisciplineDTO): Promise<CourseDisciplineResponse> {
    const { data } = await api.put<CourseDisciplineResponse>(`/course-disciplines/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/course-disciplines/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
