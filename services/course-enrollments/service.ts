import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateCourseEnrollmentDTO,
  CourseEnrollmentFilters,
  CourseEnrollmentItem,
  CourseEnrollmentResponse,
  PaginatedResponse,
  UpdateCourseEnrollmentDTO,
} from "@/types/course-enrollment.type";

export const courseEnrollmentsService = {
  async index(filters: CourseEnrollmentFilters = {}): Promise<PaginatedResponse<CourseEnrollmentItem>> {
    const { data } = await api.get<PaginatedResponse<CourseEnrollmentItem>>("/course-enrollments", {
      params: filters,
    });

    return data;
  },

  async show(id: number | string): Promise<CourseEnrollmentResponse> {
    const { data } = await api.get<CourseEnrollmentResponse>(`/course-enrollments/${id}`);

    return data;
  },

  async create(payload: CreateCourseEnrollmentDTO): Promise<CourseEnrollmentResponse> {
    const { data } = await api.post<CourseEnrollmentResponse>("/course-enrollments", payload);

    return data;
  },

  async update(id: number | string, payload: UpdateCourseEnrollmentDTO): Promise<CourseEnrollmentResponse> {
    const { data } = await api.put<CourseEnrollmentResponse>(`/course-enrollments/${id}`, payload);

    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/course-enrollments/${id}`);

    return data;
  },
};
