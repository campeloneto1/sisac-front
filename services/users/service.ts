import { api } from "@/lib/api";
import type {
  CreateUserDTO,
  PaginatedResponse,
  ResetUserPasswordDTO,
  RoleListResponse,
  UpdateUserDTO,
  UserFilters,
  UserListItem,
  UserResponse,
} from "@/types/user.type";
import type { ApiMessageResponse } from "@/types/auth.type";

export const usersService = {
  async index(filters: UserFilters = {}): Promise<PaginatedResponse<UserListItem>> {
    const { data } = await api.get<PaginatedResponse<UserListItem>>("/users", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(`/users/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateUserDTO): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/users", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateUserDTO): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(`/users/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/users/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async resetPassword(id: number | string, payload: ResetUserPasswordDTO): Promise<ApiMessageResponse> {
    const { data } = await api.post<ApiMessageResponse>(`/users/${id}/reset-password`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async roles(search?: string): Promise<RoleListResponse> {
    const { data } = await api.get<RoleListResponse>("/roles", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};

