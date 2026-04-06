import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePoliceOfficerVacationDTO,
  CreatePoliceOfficerVacationPeriodDTO,
  PaginatedResponse,
  PoliceOfficerVacationFilters,
  PoliceOfficerVacationItem,
  PoliceOfficerVacationPeriodFilters,
  PoliceOfficerVacationPeriodItem,
  PoliceOfficerVacationPeriodResponse,
  PoliceOfficerVacationResponse,
  UpdatePoliceOfficerVacationDTO,
  UpdatePoliceOfficerVacationPeriodDTO,
} from "@/types/police-officer-vacation.type";

export const policeOfficerVacationsService = {
  async index(filters: PoliceOfficerVacationFilters = {}): Promise<PaginatedResponse<PoliceOfficerVacationItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerVacationItem>>("/police-officer-vacations", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerVacationResponse> {
    const { data } = await api.get<PoliceOfficerVacationResponse>(`/police-officer-vacations/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerVacationDTO): Promise<PoliceOfficerVacationResponse> {
    const { data } = await api.post<PoliceOfficerVacationResponse>("/police-officer-vacations", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerVacationDTO): Promise<PoliceOfficerVacationResponse> {
    const { data } = await api.put<PoliceOfficerVacationResponse>(`/police-officer-vacations/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-vacations/${id}`);

    return data;
  },
  async periodsIndex(filters: PoliceOfficerVacationPeriodFilters = {}): Promise<PaginatedResponse<PoliceOfficerVacationPeriodItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerVacationPeriodItem>>("/police-officer-vacation-periods", {
      params: filters,
    });

    return data;
  },
  async periodsShow(id: number | string): Promise<PoliceOfficerVacationPeriodResponse> {
    const { data } = await api.get<PoliceOfficerVacationPeriodResponse>(`/police-officer-vacation-periods/${id}`);

    return data;
  },
  async periodsCreate(payload: CreatePoliceOfficerVacationPeriodDTO): Promise<PoliceOfficerVacationPeriodResponse> {
    const { data } = await api.post<PoliceOfficerVacationPeriodResponse>("/police-officer-vacation-periods", payload);

    return data;
  },
  async periodsUpdate(id: number | string, payload: UpdatePoliceOfficerVacationPeriodDTO): Promise<PoliceOfficerVacationPeriodResponse> {
    const { data } = await api.put<PoliceOfficerVacationPeriodResponse>(`/police-officer-vacation-periods/${id}`, payload);

    return data;
  },
  async periodsRemove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-vacation-periods/${id}`);

    return data;
  },
};
