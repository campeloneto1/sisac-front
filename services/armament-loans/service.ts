import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ArmamentLoanFilters,
  ArmamentLoanResponse,
  CreateArmamentLoanDTO,
  MarkArmamentLoanReturnedDTO,
  PaginatedArmamentLoansResponse,
  UpdateArmamentLoanDTO,
} from "@/types/armament-loan.type";

export const armamentLoansService = {
  async index(
    filters: ArmamentLoanFilters = {},
  ): Promise<PaginatedArmamentLoansResponse> {
    const { data } = await api.get<PaginatedArmamentLoansResponse>(
      "/armament-loans",
      {
        params: filters,
      },
    );

    return data;
  },

  async show(id: number | string): Promise<ArmamentLoanResponse> {
    const { data } = await api.get<ArmamentLoanResponse>(`/armament-loans/${id}`);
    return data;
  },

  async create(payload: CreateArmamentLoanDTO): Promise<ArmamentLoanResponse> {
    const { data } = await api.post<ArmamentLoanResponse>(
      "/armament-loans",
      payload,
    );
    return data;
  },

  async update(
    id: number | string,
    payload: UpdateArmamentLoanDTO,
  ): Promise<ArmamentLoanResponse> {
    const { data } = await api.put<ArmamentLoanResponse>(
      `/armament-loans/${id}`,
      payload,
    );
    return data;
  },

  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(
      `/armament-loans/${id}`,
    );
    return data;
  },

  async markAsReturned(
    id: number | string,
    payload: MarkArmamentLoanReturnedDTO,
  ): Promise<ArmamentLoanResponse> {
    const { data } = await api.post<ArmamentLoanResponse>(
      `/armament-loans/${id}/mark-as-returned`,
      payload,
    );
    return data;
  },
};
