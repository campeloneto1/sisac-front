import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerLeaveDTO,
  PaginatedResponse,
  PoliceOfficerLeaveFilters,
  PoliceOfficerLeaveItem,
  PoliceOfficerLeaveResponse,
  UpdatePoliceOfficerLeaveDTO,
} from "@/types/police-officer-leave.type";

export const policeOfficerLeavesService = {
  async index(filters: PoliceOfficerLeaveFilters = {}): Promise<PaginatedResponse<PoliceOfficerLeaveItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerLeaveItem>>("/police-officer-leaves", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerLeaveResponse> {
    const { data } = await api.get<PoliceOfficerLeaveResponse>(`/police-officer-leaves/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerLeaveDTO): Promise<PoliceOfficerLeaveResponse> {
    const { data } = await api.post<PoliceOfficerLeaveResponse>("/police-officer-leaves", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerLeaveDTO): Promise<PoliceOfficerLeaveResponse> {
    const { data } = await api.put<PoliceOfficerLeaveResponse>(`/police-officer-leaves/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-leaves/${id}`);

    return data;
  },
};
