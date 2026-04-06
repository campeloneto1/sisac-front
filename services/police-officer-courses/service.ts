import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerCourseDTO,
  PaginatedResponse,
  PoliceOfficerCourseFilters,
  PoliceOfficerCourseItem,
  PoliceOfficerCourseResponse,
  UpdatePoliceOfficerCourseDTO,
} from "@/types/police-officer-course.type";

export const policeOfficerCoursesService = {
  async index(filters: PoliceOfficerCourseFilters = {}): Promise<PaginatedResponse<PoliceOfficerCourseItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerCourseItem>>("/police-officer-courses", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerCourseResponse> {
    const { data } = await api.get<PoliceOfficerCourseResponse>(`/police-officer-courses/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerCourseDTO): Promise<PoliceOfficerCourseResponse> {
    const { data } = await api.post<PoliceOfficerCourseResponse>("/police-officer-courses", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerCourseDTO): Promise<PoliceOfficerCourseResponse> {
    const { data } = await api.put<PoliceOfficerCourseResponse>(`/police-officer-courses/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-courses/${id}`);

    return data;
  },
};
