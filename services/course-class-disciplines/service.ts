import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CourseClassDisciplineFilters,
  CourseClassDisciplineItem,
  CourseClassDisciplineResponse,
  CreateCourseClassDisciplineDTO,
  PaginatedResponse,
  UpdateCourseClassDisciplineDTO,
} from "@/types/course-class-discipline.type";

export const courseClassDisciplinesService = {
  async index(filters: CourseClassDisciplineFilters = {}): Promise<PaginatedResponse<CourseClassDisciplineItem>> {
    const { data } = await api.get<PaginatedResponse<CourseClassDisciplineItem>>("/course-class-disciplines", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<CourseClassDisciplineResponse> {
    const { data } = await api.get<CourseClassDisciplineResponse>(`/course-class-disciplines/${id}`);

    return data;
  },
  async create(payload: CreateCourseClassDisciplineDTO): Promise<CourseClassDisciplineResponse> {
    const { data } = await api.post<CourseClassDisciplineResponse>("/course-class-disciplines", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateCourseClassDisciplineDTO): Promise<CourseClassDisciplineResponse> {
    const { data } = await api.put<CourseClassDisciplineResponse>(`/course-class-disciplines/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/course-class-disciplines/${id}`);

    return data;
  },
};
