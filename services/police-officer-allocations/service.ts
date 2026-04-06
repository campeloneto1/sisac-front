import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerAllocationDTO,
  PaginatedResponse,
  PoliceOfficerAllocationFilters,
  PoliceOfficerAllocationItem,
  PoliceOfficerAllocationResponse,
  UpdatePoliceOfficerAllocationDTO,
} from "@/types/police-officer-allocation.type";

export const policeOfficerAllocationsService = {
  async index(filters: PoliceOfficerAllocationFilters = {}): Promise<PaginatedResponse<PoliceOfficerAllocationItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerAllocationItem>>("/police-officer-allocations", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerAllocationResponse> {
    const { data } = await api.get<PoliceOfficerAllocationResponse>(`/police-officer-allocations/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerAllocationDTO): Promise<PoliceOfficerAllocationResponse> {
    const { data } = await api.post<PoliceOfficerAllocationResponse>("/police-officer-allocations", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerAllocationDTO): Promise<PoliceOfficerAllocationResponse> {
    const { data } = await api.put<PoliceOfficerAllocationResponse>(`/police-officer-allocations/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-allocations/${id}`);

    return data;
  },
};
