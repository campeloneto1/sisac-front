import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateWorkshopDTO,
  PaginatedWorkshopsResponse,
  UpdateWorkshopDTO,
  WorkshopFilters,
  WorkshopResponse,
} from "@/types/workshop.type";

export const workshopsService = {
  async index(
    filters: WorkshopFilters = {},
  ): Promise<PaginatedWorkshopsResponse> {
    const { data } = await api.get<PaginatedWorkshopsResponse>("/workshops", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },

  async show(id: number | string): Promise<WorkshopResponse> {
    const { data } = await api.get<WorkshopResponse>(`/workshops/${id}`, {
      skipSubunit: true,
    });

    return data;
  },

  async create(payload: CreateWorkshopDTO): Promise<WorkshopResponse> {
    const { data } = await api.post<WorkshopResponse>("/workshops", payload, {
      skipSubunit: true,
    });

    return data;
  },

  async update(
    id: number | string,
    payload: UpdateWorkshopDTO,
  ): Promise<WorkshopResponse> {
    const { data } = await api.put<WorkshopResponse>(
      `/workshops/${id}`,
      payload,
      {
        skipSubunit: true,
      },
    );

    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/workshops/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
