import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreatePublicationTypeDTO,
  PaginatedResponse,
  PublicationTypeFilters,
  PublicationTypeItem,
  PublicationTypeResponse,
  UpdatePublicationTypeDTO,
} from "@/types/publication-type.type";

export const publicationTypesService = {
  async index(filters: PublicationTypeFilters = {}): Promise<PaginatedResponse<PublicationTypeItem>> {
    const { data } = await api.get<PaginatedResponse<PublicationTypeItem>>("/publication-types", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<PublicationTypeResponse> {
    const { data } = await api.get<PublicationTypeResponse>(`/publication-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreatePublicationTypeDTO): Promise<PublicationTypeResponse> {
    const { data } = await api.post<PublicationTypeResponse>("/publication-types", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdatePublicationTypeDTO): Promise<PublicationTypeResponse> {
    const { data } = await api.put<PublicationTypeResponse>(`/publication-types/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/publication-types/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
