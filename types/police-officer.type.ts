import type { PaginatedMeta } from "@/types/brand.type";

export interface PoliceOfficerOption {
  id: number;
  name?: string | null;
  registration_number?: string | null;
}

export interface PoliceOfficerRankItem {
  id: number;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  rank_id: number | null;
  rank?: {
    id: number;
    name: string;
    abbreviation?: string | null;
  } | null;
}

export interface PoliceOfficerItem {
  id: number;
  user_id: number;
  name?: string | null;
  cpf?: string | null;
  email?: string | null;
  phone?: string | null;
  badge_number?: string | null;
  war_name: string;
  registration_number: string;
  cc_registration_number?: string | null;
  phone2?: string | null;
  birth_date?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  inclusion_date?: string | null;
  presentation_date?: string | null;
  inclusion_bulletin?: string | null;
  presentation_bulletin?: string | null;
  transfer_bulletin?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  agency?: string | null;
  account?: string | null;
  is_active: boolean;
  bank_id?: number | null;
  city_id?: number | null;
  gender_id?: number | null;
  education_level_id?: number | null;
  user?: {
    id: number;
    name: string;
    document?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  bank?: {
    id: number;
    name: string;
    code?: string | null;
  } | null;
  city?: {
    id: number;
    name: string;
    abbreviation?: string | null;
  } | null;
  gender?: {
    id: number;
    name: string;
  } | null;
  education_level?: {
    id: number;
    name: string;
  } | null;
  current_rank?: {
    id: number;
    name: string;
    abbreviation?: string | null;
  } | null;
  rank_history?: PoliceOfficerRankItem[];
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

export interface PoliceOfficerFilters {
  page?: number;
  per_page?: number;
  search?: string;
  city_id?: number | null;
  bank_id?: number | null;
  gender_id?: number | null;
  education_level_id?: number | null;
  is_active?: boolean | null;
}

export interface CreatePoliceOfficerDTO {
  name: string;
  cpf: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  role_id?: number | null;
  badge_number?: string | null;
  war_name: string;
  registration_number: string;
  cc_registration_number?: string | null;
  phone2?: string | null;
  birth_date?: string | null;
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
  inclusion_date?: string | null;
  presentation_date?: string | null;
  inclusion_bulletin?: string | null;
  presentation_bulletin?: string | null;
  transfer_bulletin?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  agency?: string | null;
  account?: string | null;
  is_active?: boolean;
  bank_id?: number | null;
  city_id?: number | null;
  gender_id?: number | null;
  education_level_id?: number | null;
}

export interface UpdatePoliceOfficerDTO extends Partial<CreatePoliceOfficerDTO> {}

export interface PoliceOfficerResponse {
  message: string;
  data: PoliceOfficerItem;
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

export interface PoliceOfficerBankOption {
  id: number;
  name: string;
  code?: string | null;
}

export interface PoliceOfficerCityOption {
  id: number;
  name: string;
  abbreviation?: string | null;
}

export interface PoliceOfficerGenderOption {
  id: number;
  name: string;
}

export interface PoliceOfficerEducationLevelOption {
  id: number;
  name: string;
}

export interface PoliceOfficerRoleOption {
  id: number;
  name: string;
  slug: string;
}

export interface PoliceOfficerBankListResponse {
  data: PoliceOfficerBankOption[];
  meta: PaginatedMeta;
}

export interface PoliceOfficerCityListResponse {
  data: PoliceOfficerCityOption[];
  meta: PaginatedMeta;
}

export interface PoliceOfficerGenderListResponse {
  data: PoliceOfficerGenderOption[];
  meta: PaginatedMeta;
}

export interface PoliceOfficerEducationLevelListResponse {
  data: PoliceOfficerEducationLevelOption[];
  meta: PaginatedMeta;
}

export interface PoliceOfficerRoleListResponse {
  data: PoliceOfficerRoleOption[];
  meta: PaginatedMeta;
}
