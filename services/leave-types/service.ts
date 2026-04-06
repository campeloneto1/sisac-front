import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateLeaveTypeDTO,
  LeaveTypeFilters,
  LeaveTypeItem,
  LeaveTypeResponse,
  PaginatedResponse,
  UpdateLeaveTypeDTO,
} from "@/types/leave-type.type";

export const leaveTypesService = {
  async index(filters: LeaveTypeFilters = {}): Promise<PaginatedResponse<LeaveTypeItem>> {
    const { data } = await api.get<PaginatedResponse<LeaveTypeItem>>("/leave-types", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<LeaveTypeResponse> {
    const { data } = await api.get<LeaveTypeResponse>(`/leave-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateLeaveTypeDTO): Promise<LeaveTypeResponse> {
    const { data } = await api.post<LeaveTypeResponse>("/leave-types", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateLeaveTypeDTO): Promise<LeaveTypeResponse> {
    const { data } = await api.put<LeaveTypeResponse>(`/leave-types/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/leave-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
