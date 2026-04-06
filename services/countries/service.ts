import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CountryFilters,
  CountryItem,
  CountryResponse,
  CreateCountryDTO,
  PaginatedResponse,
  UpdateCountryDTO,
} from "@/types/country.type";

export const countriesService = {
  async index(filters: CountryFilters = {}): Promise<PaginatedResponse<CountryItem>> {
    const { data } = await api.get<PaginatedResponse<CountryItem>>("/countries", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<CountryResponse> {
    const { data } = await api.get<CountryResponse>(`/countries/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateCountryDTO): Promise<CountryResponse> {
    const { data } = await api.post<CountryResponse>("/countries", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateCountryDTO): Promise<CountryResponse> {
    const { data } = await api.put<CountryResponse>(`/countries/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/countries/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
