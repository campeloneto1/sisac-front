import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  BulkPromotePoliceOfficerRankDTO,
  BulkPromotePoliceOfficerRankResponse,
  CreatePoliceOfficerRankDTO,
  PoliceOfficerRankFilters,
  PoliceOfficerRankItem,
  PoliceOfficerRankResponse,
  PaginatedResponse,
  UpdatePoliceOfficerRankDTO,
} from "@/types/police-officer-rank.type";

export const policeOfficerRanksService = {
  async index(filters: PoliceOfficerRankFilters = {}): Promise<PaginatedResponse<PoliceOfficerRankItem>> {
    const { data } = await api.get<PaginatedResponse<PoliceOfficerRankItem>>("/police-officer-ranks", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<PoliceOfficerRankResponse> {
    const { data } = await api.get<PoliceOfficerRankResponse>(`/police-officer-ranks/${id}`);

    return data;
  },
  async create(payload: CreatePoliceOfficerRankDTO): Promise<PoliceOfficerRankResponse> {
    const { data } = await api.post<PoliceOfficerRankResponse>("/police-officer-ranks", payload);

    return data;
  },
  async update(id: number | string, payload: UpdatePoliceOfficerRankDTO): Promise<PoliceOfficerRankResponse> {
    const { data } = await api.put<PoliceOfficerRankResponse>(`/police-officer-ranks/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/police-officer-ranks/${id}`);

    return data;
  },
  async bulkPromote(payload: BulkPromotePoliceOfficerRankDTO): Promise<BulkPromotePoliceOfficerRankResponse> {
    const { data } = await api.post<BulkPromotePoliceOfficerRankResponse>("/police-officer-ranks/bulk-promotion", payload);

    return data;
  },
};
