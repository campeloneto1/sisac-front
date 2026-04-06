import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  AssignmentFilters,
  AssignmentItem,
  AssignmentResponse,
  CreateAssignmentDTO,
  PaginatedResponse,
  UpdateAssignmentDTO,
} from "@/types/assignment.type";

export const assignmentsService = {
  async index(filters: AssignmentFilters = {}): Promise<PaginatedResponse<AssignmentItem>> {
    const { data } = await api.get<PaginatedResponse<AssignmentItem>>("/assignments", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<AssignmentResponse> {
    const { data } = await api.get<AssignmentResponse>(`/assignments/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateAssignmentDTO): Promise<AssignmentResponse> {
    const { data } = await api.post<AssignmentResponse>("/assignments", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateAssignmentDTO): Promise<AssignmentResponse> {
    const { data } = await api.put<AssignmentResponse>(`/assignments/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/assignments/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
