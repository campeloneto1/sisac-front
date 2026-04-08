import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  ServiceItem,
  ServiceStatus,
} from "@/types/service.type";
import type { PaginatedMeta } from "@/types/brand.type";
import type { UserListItem } from "@/types/user.type";

export interface ServiceStatusHistoryItem {
  id: number;
  service_id: number;
  service?: Pick<ServiceItem, "id" | "company_id" | "service_type_id" | "status"> | null;
  from_status?: ServiceStatus | null;
  from_status_label?: string | null;
  from_status_color?: string | null;
  to_status?: ServiceStatus | null;
  to_status_label?: string | null;
  to_status_color?: string | null;
  notes?: string | null;
  changed_by: number;
  changer?: Pick<UserListItem, "id" | "name" | "email"> | null;
  changed_at?: string | null;
  created_at?: string | null;
}

export interface ServiceStatusHistoryFilters {
  page?: number;
  per_page?: number;
  service_id?: number;
  from_status?: ServiceStatus | null;
  to_status?: ServiceStatus | null;
  changed_by?: number | null;
  changed_at_from?: string;
  changed_at_to?: string;
}

export interface CreateServiceStatusHistoryDTO {
  service_id: number;
  from_status?: ServiceStatus | null;
  to_status: ServiceStatus;
  notes?: string | null;
  changed_by: number;
  changed_at?: string | null;
}

export interface UpdateServiceStatusHistoryDTO {
  service_id?: number;
  from_status?: ServiceStatus | null;
  to_status?: ServiceStatus;
  notes?: string | null;
  changed_by?: number;
  changed_at?: string | null;
}

export interface ServiceStatusHistoryResponse {
  message: string;
  data: ServiceStatusHistoryItem;
}

export interface PaginatedServiceStatusHistoryResponse {
  data: ServiceStatusHistoryItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export type ServiceStatusHistoryDeleteResponse = ApiMessageResponse;
