import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateCompanyDTO,
  CompanyFilters,
  CompanyItem,
  CompanyResponse,
  PaginatedResponse,
  UpdateCompanyDTO,
} from "@/types/company.type";

export const companiesService = {
  async index(filters: CompanyFilters = {}): Promise<PaginatedResponse<CompanyItem>> {
    const { data } = await api.get<PaginatedResponse<CompanyItem>>("/companies", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<CompanyResponse> {
    const { data } = await api.get<CompanyResponse>(`/companies/${id}`);

    return data;
  },
  async create(payload: CreateCompanyDTO): Promise<CompanyResponse> {
    const { data } = await api.post<CompanyResponse>("/companies", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateCompanyDTO): Promise<CompanyResponse> {
    const { data } = await api.put<CompanyResponse>(`/companies/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/companies/${id}`);

    return data;
  },
};
