import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateMaterialLoanDTO,
  MarkMaterialLoanReturnedDTO,
  MaterialLoanFilters,
  MaterialLoanResponse,
  PaginatedMaterialLoansResponse,
  UpdateMaterialLoanDTO,
} from "@/types/material-loan.type";

export const materialLoansService = {
  async index(
    filters: MaterialLoanFilters = {},
  ): Promise<PaginatedMaterialLoansResponse> {
    const { data } = await api.get<PaginatedMaterialLoansResponse>(
      "/material-loans",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<MaterialLoanResponse> {
    const { data } = await api.get<MaterialLoanResponse>(`/material-loans/${id}`);
    return data;
  },

  async create(payload: CreateMaterialLoanDTO): Promise<MaterialLoanResponse> {
    const { data } = await api.post<MaterialLoanResponse>(
      "/material-loans",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateMaterialLoanDTO,
  ): Promise<MaterialLoanResponse> {
    const { data } = await api.put<MaterialLoanResponse>(
      `/material-loans/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/material-loans/${id}`);
    return data;
  },

  async markAsReturned(
    id: number | string,
    payload: MarkMaterialLoanReturnedDTO,
  ): Promise<MaterialLoanResponse> {
    const { data } = await api.post<MaterialLoanResponse>(
      `/material-loans/${id}/mark-as-returned`,
      payload,
    );
    return data;
  },
};
