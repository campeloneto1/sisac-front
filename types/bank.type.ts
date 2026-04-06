import type { PaginatedMeta } from "@/types/brand.type";

export interface BankItem {
  id: number;
  name: string;
  code: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  updater?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BankFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateBankDTO {
  name: string;
  code: string;
}

export interface UpdateBankDTO {
  name?: string;
  code?: string;
}

export interface BankResponse {
  message: string;
  data: BankItem;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
