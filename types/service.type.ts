import type { PaginatedMeta } from "@/types/brand.type";
import type { CompanyItem } from "@/types/company.type";
import type { SectorItem } from "@/types/sector.type";
import type { ServiceTypeItem } from "@/types/service-type.type";
import type { UserListItem } from "@/types/user.type";

export type ServiceStatus =
  | "solicitado"
  | "aprovado"
  | "agendado"
  | "em_andamento"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "abandonado";

export type ServicePriority = "baixa" | "media" | "alta" | "urgente";

export const serviceStatusOptions: Array<{
  value: ServiceStatus;
  label: string;
}> = [
  { value: "solicitado", label: "Solicitado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "agendado", label: "Agendado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "pausado", label: "Pausado" },
  { value: "concluido", label: "Concluido" },
  { value: "cancelado", label: "Cancelado" },
  { value: "abandonado", label: "Abandonado" },
];

export const servicePriorityOptions: Array<{
  value: ServicePriority;
  label: string;
}> = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export interface ServiceItem {
  id: number;
  company_id: number;
  company?: Pick<CompanyItem, "id" | "name" | "trade_name"> | null;
  service_type_id: number;
  service_type?: Pick<
    ServiceTypeItem,
    "id" | "name" | "code" | "requires_approval"
  > | null;
  contract_id?: number | null;
  requested_by: number;
  requester?: Pick<UserListItem, "id" | "name" | "email"> | null;
  requested_at?: string | null;
  request_description: string;
  sector_id?: number | null;
  sector?: Pick<SectorItem, "id" | "name" | "abbreviation"> | null;
  location?: string | null;
  scheduled_date?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  status?: ServiceStatus | null;
  status_label?: string | null;
  status_color?: string | null;
  priority?: ServicePriority | null;
  priority_label?: string | null;
  priority_color?: string | null;
  start_observations?: string | null;
  finish_observations?: string | null;
  cancellation_reason?: string | null;
  estimated_cost?: string | number | null;
  actual_cost?: string | number | null;
  rating?: number | null;
  rating_comment?: string | null;
  creator?: Pick<UserListItem, "id" | "name" | "email"> | null;
  updater?: Pick<UserListItem, "id" | "name" | "email"> | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface ServiceFilters {
  page?: number;
  per_page?: number;
  search?: string;
  company_id?: number | null;
  service_type_id?: number | null;
  status?: ServiceStatus | null;
  priority?: ServicePriority | null;
  requested_by?: number | null;
  sector_id?: number | null;
  scheduled_date_from?: string;
  scheduled_date_to?: string;
}

export interface CreateServiceDTO {
  company_id: number;
  service_type_id: number;
  contract_id?: number | null;
  requested_by: number;
  requested_at?: string | null;
  request_description: string;
  sector_id?: number | null;
  location?: string | null;
  scheduled_date?: string | null;
  status?: ServiceStatus;
  priority?: ServicePriority;
  estimated_cost?: number | null;
}

export interface UpdateServiceDTO {
  company_id?: number;
  service_type_id?: number;
  contract_id?: number | null;
  requested_by?: number;
  requested_at?: string | null;
  request_description?: string;
  sector_id?: number | null;
  location?: string | null;
  scheduled_date?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  status?: ServiceStatus;
  priority?: ServicePriority;
  start_observations?: string | null;
  finish_observations?: string | null;
  cancellation_reason?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  rating?: number | null;
  rating_comment?: string | null;
}

export interface ServiceResponse {
  message: string;
  data: ServiceItem;
}

export interface PaginatedServicesResponse {
  data: ServiceItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export function getServiceStatusVariant(status?: string | null) {
  switch (status) {
    case "concluido":
      return "success" as const;
    case "cancelado":
    case "abandonado":
      return "danger" as const;
    case "em_andamento":
    case "pausado":
      return "warning" as const;
    case "aprovado":
    case "agendado":
      return "info" as const;
    default:
      return "outline" as const;
  }
}

export function getServicePriorityVariant(priority?: string | null) {
  switch (priority) {
    case "urgente":
      return "danger" as const;
    case "alta":
      return "warning" as const;
    case "media":
      return "info" as const;
    default:
      return "outline" as const;
  }
}
