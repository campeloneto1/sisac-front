import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CourseClassFilters,
  CourseClassItem,
  CourseClassResponse,
  CreateCourseClassDTO,
  PaginatedResponse,
  UpdateCourseClassDTO,
} from "@/types/course-class.type";

export const courseClassesService = {
  async index(filters: CourseClassFilters = {}): Promise<PaginatedResponse<CourseClassItem>> {
    const { data } = await api.get<PaginatedResponse<CourseClassItem>>("/course-classes", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<CourseClassResponse> {
    const { data } = await api.get<CourseClassResponse>(`/course-classes/${id}`);

    return data;
  },
  async create(payload: CreateCourseClassDTO): Promise<CourseClassResponse> {
    const { data } = await api.post<CourseClassResponse>("/course-classes", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateCourseClassDTO): Promise<CourseClassResponse> {
    const { data } = await api.put<CourseClassResponse>(`/course-classes/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/course-classes/${id}`);

    return data;
  },
};
