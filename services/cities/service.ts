import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CityFilters,
  CityItem,
  CityResponse,
  CityStateListResponse,
  CreateCityDTO,
  PaginatedResponse,
  UpdateCityDTO,
} from "@/types/city.type";

export const citiesService = {
  async index(filters: CityFilters = {}): Promise<PaginatedResponse<CityItem>> {
    const { data } = await api.get<PaginatedResponse<CityItem>>("/cities", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<CityResponse> {
    const { data } = await api.get<CityResponse>(`/cities/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateCityDTO): Promise<CityResponse> {
    const { data } = await api.post<CityResponse>("/cities", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateCityDTO): Promise<CityResponse> {
    const { data } = await api.put<CityResponse>(`/cities/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/cities/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async states(search?: string): Promise<CityStateListResponse> {
    const { data } = await api.get<CityStateListResponse>("/states", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};
