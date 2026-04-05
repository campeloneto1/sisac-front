import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateRoleDTO,
  PaginatedResponse,
  PermissionOption,
  RoleFilters,
  RoleItem,
  RoleResponse,
  UpdateRoleDTO,
} from "@/types/role.type";

export const rolesService = {
  async index(filters: RoleFilters = {}): Promise<PaginatedResponse<RoleItem>> {
    const { data } = await api.get<PaginatedResponse<RoleItem>>("/roles", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<RoleResponse> {
    const { data } = await api.get<RoleResponse>(`/roles/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateRoleDTO): Promise<RoleResponse> {
    const { data } = await api.post<RoleResponse>("/roles", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateRoleDTO): Promise<RoleResponse> {
    const { data } = await api.put<RoleResponse>(`/roles/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/roles/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async permissions(search?: string): Promise<PaginatedResponse<PermissionOption>> {
    const { data } = await api.get<PaginatedResponse<PermissionOption>>("/permissions", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};

