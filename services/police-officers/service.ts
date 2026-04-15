import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerDTO,
  PaginatedResponse,
  PoliceOfficerBankListResponse,
  PoliceOfficerCityListResponse,
  PoliceOfficerEducationLevelListResponse,
  PoliceOfficerFilters,
  PoliceOfficerGenderListResponse,
  PoliceOfficerItem,
  PoliceOfficerResponse,
  PoliceOfficerRoleListResponse,
  PoliceOfficerSectorListResponse,
  PoliceOfficerRankListResponse,
  PoliceOfficerAssignmentListResponse,
  UpdatePoliceOfficerDTO,
} from "@/types/police-officer.type";

export const policeOfficersService = {
  async index(filters: PoliceOfficerFilters = {}): Promise<PaginatedResponse<PoliceOfficerItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerItem>>("/police-officers", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerResponse> {
    const { data } = await api.get<PoliceOfficerResponse>(`/police-officers/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerDTO): Promise<PoliceOfficerResponse> {
    const { data } = await api.post<PoliceOfficerResponse>("/police-officers", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerDTO): Promise<PoliceOfficerResponse> {
    const { data } = await api.put<PoliceOfficerResponse>(`/police-officers/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officers/${id}`);

    return data;
  },
  async banks(search?: string): Promise<PoliceOfficerBankListResponse> {
    const { data } = await api.get<PoliceOfficerBankListResponse>("/banks", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async cities(search?: string): Promise<PoliceOfficerCityListResponse> {
    const { data } = await api.get<PoliceOfficerCityListResponse>("/cities", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async genders(search?: string): Promise<PoliceOfficerGenderListResponse> {
    const { data } = await api.get<PoliceOfficerGenderListResponse>("/genders", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async educationLevels(search?: string): Promise<PoliceOfficerEducationLevelListResponse> {
    const { data } = await api.get<PoliceOfficerEducationLevelListResponse>("/education-levels", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async roles(search?: string): Promise<PoliceOfficerRoleListResponse> {
    const { data } = await api.get<PoliceOfficerRoleListResponse>("/roles", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async sectors(search?: string): Promise<PoliceOfficerSectorListResponse> {
    const { data } = await api.get<PoliceOfficerSectorListResponse>("/sectors", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async ranks(search?: string): Promise<PoliceOfficerRankListResponse> {
    const { data } = await api.get<PoliceOfficerRankListResponse>("/ranks", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async assignments(search?: string): Promise<PoliceOfficerAssignmentListResponse> {
    const { data } = await api.get<PoliceOfficerAssignmentListResponse>("/assignments", {
      params: { per_page: 100, search },
      skipSubunit: true,
    });

    return data;
  },
  async uploadProfilePhoto(id: number | string, photo: File): Promise<ApiMessageResponse> {
    const formData = new FormData();
    formData.append("photo", photo);

    const { data } = await api.post<ApiMessageResponse>(`/police-officers/${id}/profile-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
  async deleteProfilePhoto(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officers/${id}/profile-photo`);

    return data;
  },
};
