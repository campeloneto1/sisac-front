import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  BrandFilters,
  BrandItem,
  BrandResponse,
  CreateBrandDTO,
  PaginatedResponse,
  UpdateBrandDTO,
} from "@/types/brand.type";

export const brandsService = {
  async index(filters: BrandFilters = {}): Promise<PaginatedResponse<BrandItem>> {
    const { data } = await api.get<PaginatedResponse<BrandItem>>("/brands", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<BrandResponse> {
    const { data } = await api.get<BrandResponse>(`/brands/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateBrandDTO): Promise<BrandResponse> {
    const { data } = await api.post<BrandResponse>("/brands", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateBrandDTO): Promise<BrandResponse> {
    const { data } = await api.put<BrandResponse>(`/brands/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/brands/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
