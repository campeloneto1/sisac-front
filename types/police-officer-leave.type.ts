import type { PaginatedMeta } from "@/types/brand.type";

export interface PoliceOfficerLeaveStatusInfo {
  value: string;
  label: string;
  color?: string | null;
  requires_copem?: boolean;
}

export interface PoliceOfficerLeaveCopemResultInfo {
  value: string;
  label: string;
  color?: string | null;
  can_return_to_work?: boolean;
}

export interface PoliceOfficerLeaveUploadItem {
  id: number;
  file_name?: string | null;
  original_name?: string | null;
  mime_type?: string | null;
  extension?: string | null;
  size?: number | null;
  url?: string | null;
}

export interface PoliceOfficerLeaveItem {
  id: number;
  police_officer_id: number;
  leave_type_id: number;
  previous_leave_id?: number | null;
  is_renewal?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  days?: number | null;
  compen_date?: string | null;
  crm_number?: string | null;
  cid_code?: string | null;
  hospital_name?: string | null;
  notes?: string | null;
  status?: PoliceOfficerLeaveStatusInfo | null;
  requires_copem?: boolean;
  sent_to_copem_at?: string | null;
  copem_protocol?: string | null;
  copem_scheduled_date?: string | null;
  copem_evaluation_date?: string | null;
  copem_report_date?: string | null;
  copem_result?: PoliceOfficerLeaveCopemResultInfo | null;
  copem_notes?: string | null;
  police_officer?: {
    id: number;
    user_id?: number | null;
    name?: string | null;
    war_name?: string | null;
    registration_number?: string | null;
    user?: {
      id: number;
      name: string;
    } | null;
  } | null;
  leave_type?: {
    id: number;
    name: string;
    slug?: string | null;
    requires_medical_report?: boolean;
    affects_salary?: boolean;
    max_days?: number | null;
  } | null;
  previous_leave?: PoliceOfficerLeaveItem | null;
  renewals?: PoliceOfficerLeaveItem[];
  uploads?: PoliceOfficerLeaveUploadItem[];
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

export interface PoliceOfficerLeaveFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  police_officer_id?: number | null;
  leave_type_id?: number | null;
  start_date_from?: string;
  start_date_to?: string;
}

export interface CreatePoliceOfficerLeaveDTO {
  police_officer_id: number;
  leave_type_id: number;
  previous_leave_id?: number | null;
  is_renewal?: boolean;
  start_date: string;
  end_date: string;
  compen_date?: string | null;
  crm_number?: string | null;
  cid_code?: string | null;
  hospital_name?: string | null;
  notes?: string | null;
  status?: string | null;
  requires_copem?: boolean;
  copem_protocol?: string | null;
  copem_scheduled_date?: string | null;
  copem_evaluation_date?: string | null;
  copem_report_date?: string | null;
  copem_result?: string | null;
  copem_notes?: string | null;
}

export type UpdatePoliceOfficerLeaveDTO = Partial<CreatePoliceOfficerLeaveDTO>;

export interface PoliceOfficerLeaveResponse {
  message: string;
  data: PoliceOfficerLeaveItem;
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

export const POLICE_OFFICER_LEAVE_STATUS_OPTIONS = [
  { value: "requested", label: "Solicitado" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
  { value: "ongoing", label: "Em andamento" },
  { value: "awaiting_copem", label: "Aguardando COPEM" },
  { value: "copem_scheduled", label: "COPEM agendada" },
  { value: "in_copem_evaluation", label: "Em avaliacao COPEM" },
  { value: "copem_approved", label: "Aprovado pela COPEM" },
  { value: "copem_rejected", label: "Reprovado pela COPEM" },
  { value: "completed", label: "Concluido" },
  { value: "returned_to_work", label: "Retornou ao trabalho" },
] as const;

export const POLICE_OFFICER_LEAVE_COPEM_RESULT_OPTIONS = [
  { value: "fit_for_duty", label: "Apto ao servico" },
  { value: "light_duty", label: "Servicos leves" },
  { value: "unfit_for_duty", label: "Inapto" },
  { value: "under_evaluation", label: "Em avaliacao" },
] as const;
