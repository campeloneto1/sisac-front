import type { PaginatedMeta } from "@/types/brand.type";

export interface PoliceOfficerVacationStatusInfo {
  value: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface PoliceOfficerVacationPeriodStatusInfo {
  value: string;
  label: string;
  color?: string | null;
  description?: string | null;
}

export interface PoliceOfficerVacationPeriodItem {
  id: number;
  police_officer_vacation_id: number;
  start_date?: string | null;
  end_date?: string | null;
  days?: number | null;
  status?: PoliceOfficerVacationPeriodStatusInfo | null;
  bulletin_start?: string | null;
  bulletin_return?: string | null;
  police_officer_vacation?: {
    id: number;
    reference_year?: number | null;
    police_officer_id?: number | null;
    police_officer?: {
      id: number;
      user_id?: number | null;
      name?: string | null;
      war_name?: string | null;
      badge_number?: string | null;
      registration_number?: string | null;
      current_rank?: {
        id: number;
        name: string;
        abbreviation?: string | null;
      } | null;
      user?: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
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

export interface PoliceOfficerVacationItem {
  id: number;
  police_officer_id: number;
  reference_year: number;
  total_days: number;
  used_days?: number | null;
  sold_days?: number | null;
  remaining_days?: number | null;
  available_days?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_expired?: boolean;
  can_add_period?: boolean;
  status?: PoliceOfficerVacationStatusInfo | null;
  authorization_bulletin?: string | null;
  fractionation_bulletin?: string | null;
  sale_bulletin?: string | null;
  published_at?: string | null;
  police_officer?: {
    id: number;
    user_id?: number | null;
    name?: string | null;
    war_name?: string | null;
    badge_number?: string | null;
    registration_number?: string | null;
    current_rank?: {
      id: number;
      name: string;
      abbreviation?: string | null;
    } | null;
    user?: {
      id: number;
      name: string;
    } | null;
  } | null;
  periods?: PoliceOfficerVacationPeriodItem[];
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

export interface PoliceOfficerVacationFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  reference_year?: number | null;
  police_officer_id?: number | null;
}

export interface PoliceOfficerVacationPeriodFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  police_officer_vacation_id?: number | null;
  police_officer_id?: number | null;
  start_date_from?: string;
  start_date_to?: string;
}

export interface CreatePoliceOfficerVacationDTO {
  police_officer_id: number;
  reference_year: number;
  total_days: number;
  sold_days?: number | null;
  authorization_bulletin?: string | null;
  fractionation_bulletin?: string | null;
  sale_bulletin?: string | null;
}

export type UpdatePoliceOfficerVacationDTO = Partial<CreatePoliceOfficerVacationDTO>;

export interface CreatePoliceOfficerVacationPeriodDTO {
  police_officer_vacation_id: number;
  start_date: string;
  end_date: string;
  status?: string | null;
  bulletin_start?: string | null;
  bulletin_return?: string | null;
}

export type UpdatePoliceOfficerVacationPeriodDTO = Partial<CreatePoliceOfficerVacationPeriodDTO>;

export interface PoliceOfficerVacationResponse {
  message: string;
  data: PoliceOfficerVacationItem;
}

export interface PoliceOfficerVacationPeriodResponse {
  message: string;
  data: PoliceOfficerVacationPeriodItem;
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

export const POLICE_OFFICER_VACATION_STATUS_OPTIONS = [
  { value: "open", label: "Aberto" },
  { value: "partial", label: "Parcial" },
  { value: "completed", label: "Concluido" },
  { value: "sold", label: "Dias vendidos" },
  { value: "expired", label: "Expirado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

export const POLICE_OFFICER_VACATION_PERIOD_STATUS_OPTIONS = [
  { value: "planned", label: "Planejado" },
  { value: "approved", label: "Aprovado" },
  { value: "ongoing", label: "Em andamento" },
  { value: "completed", label: "Concluido" },
  { value: "cancelled", label: "Cancelado" },
  { value: "interrupted", label: "Interrompido" },
] as const;
