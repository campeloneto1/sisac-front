import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateUnitDTO,
  PaginatedResponse,
  UnitCityListResponse,
  UnitFilters,
  UnitItem,
  UnitOfficerListResponse,
  UnitResponse,
  UpdateUnitDTO,
} from "@/types/unit.type";

export const unitsService = {
  async index(filters: UnitFilters = {}): Promise<PaginatedResponse<UnitItem>> {
    const { data } = await api.get<PaginatedResponse<UnitItem>>("/units", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<UnitResponse> {
    const { data } = await api.get<UnitResponse>(`/units/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateUnitDTO): Promise<UnitResponse> {
    const { data } = await api.post<UnitResponse>("/units", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateUnitDTO): Promise<UnitResponse> {
    const { data } = await api.put<UnitResponse>(`/units/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/units/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async cities(search?: string): Promise<UnitCityListResponse> {
    const { data } = await api.get<UnitCityListResponse>("/cities", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
  async policeOfficers(search?: string): Promise<UnitOfficerListResponse> {
    const { data } = await api.get<UnitOfficerListResponse>("/police-officers", {
      params: {
        per_page: 100,
        search,
      },
      skipSubunit: true,
    });

    return data;
  },
};
