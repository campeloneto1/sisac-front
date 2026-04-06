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
  UpdatePoliceOfficerDTO,
} from "@/types/police-officer.type";

export const policeOfficersService = {
  async index(filters: PoliceOfficerFilters = {}): Promise<PaginatedResponse<PoliceOfficerItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerItem>>("/police-officers", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerResponse> {
    const { data } = await api.get<PoliceOfficerResponse>(`/police-officers/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreatePoliceOfficerDTO): Promise<PoliceOfficerResponse> {
    const { data } = await api.post<PoliceOfficerResponse>("/police-officers", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerDTO): Promise<PoliceOfficerResponse> {
    const { data } = await api.put<PoliceOfficerResponse>(`/police-officers/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officers/${id}`, {
      skipSubunit: true,
    });

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
};
