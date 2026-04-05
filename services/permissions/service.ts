import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePermissionDTO,
  PaginatedResponse,
  PermissionFilters,
  PermissionItem,
  PermissionResponse,
  UpdatePermissionDTO,
} from "@/types/permission.type";

export const permissionsService = {
  async index(filters: PermissionFilters = {}): Promise<PaginatedResponse<PermissionItem>> {
    const { data } = await api.get<PaginatedResponse<PermissionItem>>("/permissions", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<PermissionResponse> {
    const { data } = await api.get<PermissionResponse>(`/permissions/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreatePermissionDTO): Promise<PermissionResponse> {
    const { data } = await api.post<PermissionResponse>("/permissions", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdatePermissionDTO): Promise<PermissionResponse> {
    const { data } = await api.put<PermissionResponse>(`/permissions/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/permissions/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};

