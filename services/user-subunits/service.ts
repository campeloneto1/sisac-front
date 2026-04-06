import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateUserSubunitDTO,
  PaginatedResponse,
  SubunitListResponse,
  UserSubunitFilters,
  UserSubunitItem,
  UserSubunitResponse,
} from "@/types/user-subunit.type";

export const userSubunitsService = {
  async index(filters: UserSubunitFilters = {}): Promise<PaginatedResponse<UserSubunitItem>> {
    const { data } = await api.get<PaginatedResponse<UserSubunitItem>>("/user-subunits", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateUserSubunitDTO): Promise<UserSubunitResponse> {
    const { data } = await api.post<UserSubunitResponse>("/user-subunits", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/user-subunits/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async subunits(search?: string): Promise<SubunitListResponse> {
    const { data } = await api.get<SubunitListResponse>("/subunits", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};
