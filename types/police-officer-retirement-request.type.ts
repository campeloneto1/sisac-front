import type { PoliceOfficerItem } from "./police-officer.type";

export type PoliceOfficerRetirementRequestStatus =
  | "requested"
  | "in_analysis"
  | "approved"
  | "published"
  | "denied"
  | "cancelled";

export interface PoliceOfficerRetirementRequestItem {
  id: number;
  police_officer_id: number;
  nup?: string | null;
  bulletin_request?: string | null;
  bulletin_publication?: string | null;
  requested_at: string;
  approved_at?: string | null;
  published_at?: string | null;
  status: PoliceOfficerRetirementRequestStatus;
  notes?: string | null;
  police_officer?: PoliceOfficerItem | null;
  creator?: { id: number; name: string; email: string } | null;
  updater?: { id: number; name: string; email: string } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PoliceOfficerRetirementRequestFilters {
  page?: number;
  per_page?: number;
  search?: string;
  police_officer_id?: number;
  status?: PoliceOfficerRetirementRequestStatus;
  requested_at_from?: string;
  requested_at_to?: string;
}

export interface CreatePoliceOfficerRetirementRequestDTO {
  police_officer_id: number;
  nup?: string | null;
  bulletin_request?: string | null;
  bulletin_publication?: string | null;
  requested_at: string;
  approved_at?: string | null;
  published_at?: string | null;
  status?: PoliceOfficerRetirementRequestStatus;
  notes?: string | null;
}

export type UpdatePoliceOfficerRetirementRequestDTO =
  Partial<CreatePoliceOfficerRetirementRequestDTO>;

export interface PoliceOfficerRetirementRequestResponse {
  message: string;
  data: PoliceOfficerRetirementRequestItem;
}

export interface PaginatedPoliceOfficerRetirementRequestResponse {
  data: PoliceOfficerRetirementRequestItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const RETIREMENT_REQUEST_STATUS_LABELS: Record<
  PoliceOfficerRetirementRequestStatus,
  string
> = {
  requested: "Solicitado",
  in_analysis: "Em analise",
  approved: "Aprovado",
  published: "Publicado",
  denied: "Indeferido",
  cancelled: "Cancelado",
};

export const RETIREMENT_REQUEST_STATUS_OPTIONS: {
  value: PoliceOfficerRetirementRequestStatus;
  label: string;
}[] = [
  { value: "requested", label: "Solicitado" },
  { value: "in_analysis", label: "Em analise" },
  { value: "approved", label: "Aprovado" },
  { value: "published", label: "Publicado" },
  { value: "denied", label: "Indeferido" },
  { value: "cancelled", label: "Cancelado" },
];
