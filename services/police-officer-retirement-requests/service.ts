import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerRetirementRequestDTO,
  PaginatedPoliceOfficerRetirementRequestResponse,
  PoliceOfficerRetirementRequestFilters,
  PoliceOfficerRetirementRequestResponse,
  UpdatePoliceOfficerRetirementRequestDTO,
} from "@/types/police-officer-retirement-request.type";

export const policeOfficerRetirementRequestsService = {
  async index(
    filters: PoliceOfficerRetirementRequestFilters = {},
  ): Promise<PaginatedPoliceOfficerRetirementRequestResponse> {
    const { data } =
      await api.get<PaginatedPoliceOfficerRetirementRequestResponse>(
        "/police-officer-retirement-requests",
        { params: filters },
      );
    return data;
  },

  async show(
    id: number | string,
  ): Promise<PoliceOfficerRetirementRequestResponse> {
    const { data } = await api.get<PoliceOfficerRetirementRequestResponse>(
      `/police-officer-retirement-requests/${id}`,
    );
    return data;
  },

  async create(
    payload: CreatePoliceOfficerRetirementRequestDTO,
  ): Promise<PoliceOfficerRetirementRequestResponse> {
    const { data } = await api.post<PoliceOfficerRetirementRequestResponse>(
      "/police-officer-retirement-requests",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdatePoliceOfficerRetirementRequestDTO,
  ): Promise<PoliceOfficerRetirementRequestResponse> {
    const { data } = await api.put<PoliceOfficerRetirementRequestResponse>(
      `/police-officer-retirement-requests/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/police-officer-retirement-requests/${id}`,
    );
    return data;
  },
};
