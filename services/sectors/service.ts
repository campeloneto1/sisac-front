import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateSectorDTO,
  PaginatedResponse,
  SectorFilters,
  SectorItem,
  SectorOfficerListResponse,
  SectorResponse,
  UpdateSectorDTO,
} from "@/types/sector.type";

export const sectorsService = {
  async index(filters: SectorFilters = {}): Promise<PaginatedResponse<SectorItem>> {
    const { data } = await api.get<PaginatedResponse<SectorItem>>("/sectors", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<SectorResponse> {
    const { data } = await api.get<SectorResponse>(`/sectors/${id}`);

    return data;
  },
  async create(payload: CreateSectorDTO): Promise<SectorResponse> {
    const { data } = await api.post<SectorResponse>("/sectors", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateSectorDTO): Promise<SectorResponse> {
    const { data } = await api.put<SectorResponse>(`/sectors/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/sectors/${id}`);

    return data;
  },
  async policeOfficers(search?: string): Promise<SectorOfficerListResponse> {
    const { data } = await api.get<SectorOfficerListResponse>("/police-officers", {
      params: {
        per_page: 100,
        search,
      },
    });

    return data;
  },
};
