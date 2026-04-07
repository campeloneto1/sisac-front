import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ColorFilters,
  ColorResponse,
  CreateColorDTO,
  PaginatedColorsResponse,
  UpdateColorDTO,
} from "@/types/color.type";

export const colorsService = {
  async index(filters: ColorFilters = {}): Promise<PaginatedColorsResponse> {
    const { data } = await api.get<PaginatedColorsResponse>("/colors", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },

  async show(id: number | string): Promise<ColorResponse> {
    const { data } = await api.get<ColorResponse>(`/colors/${id}`, {
      skipSubunit: true,
    });

    return data;
  },

  async create(payload: CreateColorDTO): Promise<ColorResponse> {
    const { data } = await api.post<ColorResponse>("/colors", payload, {
      skipSubunit: true,
    });

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateColorDTO,
  ): Promise<ColorResponse> {
    const { data } = await api.put<ColorResponse>(`/colors/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/colors/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
