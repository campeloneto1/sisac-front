import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CountryListResponse,
  CreateStateDTO,
  PaginatedResponse,
  StateFilters,
  StateItem,
  StateResponse,
  UpdateStateDTO,
} from "@/types/state.type";

export const statesService = {
  async index(filters: StateFilters = {}): Promise<PaginatedResponse<StateItem>> {
    const { data } = await api.get<PaginatedResponse<StateItem>>("/states", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<StateResponse> {
    const { data } = await api.get<StateResponse>(`/states/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateStateDTO): Promise<StateResponse> {
    const { data } = await api.post<StateResponse>("/states", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateStateDTO): Promise<StateResponse> {
    const { data } = await api.put<StateResponse>(`/states/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/states/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async countries(search?: string): Promise<CountryListResponse> {
    const { data } = await api.get<CountryListResponse>("/countries", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};
