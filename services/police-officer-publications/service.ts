import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerPublicationDTO,
  PaginatedPoliceOfficerPublicationResponse,
  PoliceOfficerPublicationFilters,
  PoliceOfficerPublicationResponse,
  UpdatePoliceOfficerPublicationDTO,
} from "@/types/police-officer-publication.type";

export const policeOfficerPublicationsService = {
  async index(
    filters: PoliceOfficerPublicationFilters = {},
  ): Promise<PaginatedPoliceOfficerPublicationResponse> {
    const { data } = await api.get<PaginatedPoliceOfficerPublicationResponse>(
      "/police-officer-publications",
      { params: filters },
    );
    return data;
  },

  async show(id: number | string): Promise<PoliceOfficerPublicationResponse> {
    const { data } = await api.get<PoliceOfficerPublicationResponse>(
      `/police-officer-publications/${id}`,
    );
    return data;
  },

  async create(
    payload: CreatePoliceOfficerPublicationDTO,
  ): Promise<PoliceOfficerPublicationResponse> {
    const { data } = await api.post<PoliceOfficerPublicationResponse>(
      "/police-officer-publications",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdatePoliceOfficerPublicationDTO,
  ): Promise<PoliceOfficerPublicationResponse> {
    const { data } = await api.put<PoliceOfficerPublicationResponse>(
      `/police-officer-publications/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/police-officer-publications/${id}`,
    );
    return data;
  },
};
