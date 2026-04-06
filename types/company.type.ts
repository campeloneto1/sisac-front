import type { PaginatedMeta } from "@/types/brand.type";
import { CityItem } from "./city.type";
import { SubunitItem } from "./subunit.type";

export interface CompanyItem {
  id: number;
  subunit_id: number;
  name: string;
  trade_name: string | null;
  cnpj: string | null;
  manager_name: string | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  postal_code: string | null;
  city_id: number | null;
  created_by: number;
  updated_by: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  city?: CityItem;
  subunit?: SubunitItem;
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
}

export interface CreateCompanyDTO {
  subunit_id: number;
  name: string;
  trade_name?: string;
  cnpj?: string;
  manager_name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  postal_code?: string;
  city_id?: number;
}

export interface UpdateCompanyDTO {
  subunit_id?: number;
  name?: string;
  trade_name?: string;
  cnpj?: string;
  manager_name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  postal_code?: string;
  city_id?: number;
}

export interface CompanyFilters {
  page?: number;
  per_page?: number;
  search?: string;
  city_id?: number;
  subunit_id?: number;
}

export interface CompanyResponse {
  message: string;
  data: CompanyItem;
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
