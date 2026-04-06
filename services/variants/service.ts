import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  BrandListResponse,
  CreateVariantDTO,
  PaginatedResponse,
  UpdateVariantDTO,
  VariantFilters,
  VariantItem,
  VariantResponse,
} from "@/types/variant.type";

export const variantsService = {
  async index(filters: VariantFilters = {}): Promise<PaginatedResponse<VariantItem>> {
    const { data } = await api.get<PaginatedResponse<VariantItem>>("/variants", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<VariantResponse> {
    const { data } = await api.get<VariantResponse>(`/variants/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateVariantDTO): Promise<VariantResponse> {
    const { data } = await api.post<VariantResponse>("/variants", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateVariantDTO): Promise<VariantResponse> {
    const { data } = await api.put<VariantResponse>(`/variants/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/variants/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async brands(search?: string): Promise<BrandListResponse> {
    const { data } = await api.get<BrandListResponse>("/brands", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};
