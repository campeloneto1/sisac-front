import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  BankFilters,
  BankItem,
  BankResponse,
  CreateBankDTO,
  PaginatedResponse,
  UpdateBankDTO,
} from "@/types/bank.type";

export const banksService = {
  async index(filters: BankFilters = {}): Promise<PaginatedResponse<BankItem>> {
    const { data } = await api.get<PaginatedResponse<BankItem>>("/banks", {
      params: filters,
      skipSubunit: true,
    });

    return data;
  },
  async show(id: number | string): Promise<BankResponse> {
    const { data } = await api.get<BankResponse>(`/banks/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
  async create(payload: CreateBankDTO): Promise<BankResponse> {
    const { data } = await api.post<BankResponse>("/banks", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async update(id: number | string, payload: UpdateBankDTO): Promise<BankResponse> {
    const { data } = await api.put<BankResponse>(`/banks/${id}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/banks/${id}`, {
      skipSubunit: true,
    });

    return data;
  },
};
