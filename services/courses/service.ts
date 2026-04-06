import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CourseFilters,
  CourseItem,
  CourseResponse,
  CreateCourseDTO,
  PaginatedResponse,
  UpdateCourseDTO,
} from "@/types/course.type";

export const coursesService = {
  async index(filters: CourseFilters = {}): Promise<PaginatedResponse<CourseItem>> {
    const { data } = await api.get<PaginatedResponse<CourseItem>>("/courses", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<CourseResponse> {
    const { data } = await api.get<CourseResponse>(`/courses/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateCourseDTO): Promise<CourseResponse> {
    const { data } = await api.post<CourseResponse>("/courses", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateCourseDTO): Promise<CourseResponse> {
    const { data } = await api.put<CourseResponse>(`/courses/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/courses/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
