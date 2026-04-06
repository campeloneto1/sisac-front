import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateSubunitDTO,
  PaginatedResponse,
  SubunitCityListResponse,
  SubunitFilters,
  SubunitItem,
  SubunitOfficerListResponse,
  SubunitResponse,
  SubunitUnitListResponse,
  UpdateSubunitDTO,
} from "@/types/subunit.type";

export const subunitsService = {
  async index(filters: SubunitFilters = {}): Promise<PaginatedResponse<SubunitItem>> {
    const { data } = await api.get<PaginatedResponse<SubunitItem>>("/subunits", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<SubunitResponse> {
    const { data } = await api.get<SubunitResponse>(`/subunits/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateSubunitDTO): Promise<SubunitResponse> {
    const { data } = await api.post<SubunitResponse>("/subunits", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateSubunitDTO): Promise<SubunitResponse> {
    const { data } = await api.put<SubunitResponse>(`/subunits/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/subunits/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async cities(search?: string): Promise<SubunitCityListResponse> {
    const { data } = await api.get<SubunitCityListResponse>("/cities", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async units(search?: string): Promise<SubunitUnitListResponse> {
    const { data } = await api.get<SubunitUnitListResponse>("/units", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async policeOfficers(search?: string): Promise<SubunitOfficerListResponse> {
    const { data } = await api.get<SubunitOfficerListResponse>("/police-officers", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
};
