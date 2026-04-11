import type { PaginatedMeta } from "@/types/brand.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { UserListItem } from "@/types/user.type";

export type NoticeType = "info" | "warning" | "error" | "success";
export type NoticePriority = 0 | 1 | 2;
export type NoticeVisibility = "public" | "authenticated";
export type NoticeStatus = "draft" | "scheduled" | "active" | "expired" | "inactive";
export type NoticeTargetType = "all" | "sector" | "user" | "role";

export interface NoticeTargetItem {
  id: number;
  target_type: NoticeTargetType;
  target_id: number | null;
}

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  type: NoticeType;
  priority: NoticePriority;
  visibility: NoticeVisibility;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  is_pinned: boolean;
  requires_acknowledgement: boolean;
  status: NoticeStatus;
  has_read: boolean;
  has_acknowledged: boolean;
  read_at: string | null;
  acknowledged_at: string | null;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  targets_count?: number | null;
  reads_count?: number | null;
  targets?: NoticeTargetItem[];
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
  deleted_at?: string | null;
}

export interface NoticeFilters {
  page?: number;
  per_page?: number;
  search?: string;
  type?: NoticeType;
  visibility?: NoticeVisibility;
  priority?: NoticePriority;
  is_active?: boolean;
  is_pinned?: boolean;
  requires_acknowledgement?: boolean;
  status?: Exclude<NoticeStatus, "draft"> | "draft";
}

export interface MyNoticeFilters {
  page?: number;
  per_page?: number;
  search?: string;
  type?: NoticeType;
  read?: boolean | null;
  acknowledged?: boolean | null;
}

export interface NoticeTargetPayload {
  target_type: NoticeTargetType;
  target_id: number | null;
}

export interface NoticeReadItem {
  id: number;
  user: UserListItem;
  read_at: string;
  acknowledged_at: string | null;
  has_acknowledged: boolean;
}

export interface NoticeReadFilters {
  page?: number;
  per_page?: number;
  search?: string;
  acknowledged?: boolean | null;
}

export interface NoticeTargetWithData {
  id: number;
  target_type: NoticeTargetType;
  target_id: number | null;
  target_data: {
    id?: number;
    name: string;
    email?: string;
    abbreviation?: string;
    slug?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface NoticeTargetFilters {
  page?: number;
  per_page?: number;
  search?: string;
  target_type?: NoticeTargetType;
}

export interface CreateNoticeDTO {
  title: string;
  content: string;
  type: NoticeType;
  priority: NoticePriority;
  visibility: NoticeVisibility;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  is_pinned?: boolean;
  requires_acknowledgement?: boolean;
  targets?: NoticeTargetPayload[];
}

export interface UpdateNoticeDTO {
  title?: string;
  content?: string;
  type?: NoticeType;
  priority?: NoticePriority;
  visibility?: NoticeVisibility;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  is_pinned?: boolean;
  requires_acknowledgement?: boolean;
  targets?: NoticeTargetPayload[];
}

export interface NoticeResponse {
  message: string;
  data: NoticeItem;
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

export type NoticeReadResponse = PaginatedResponse<NoticeReadItem>;
export type NoticeTargetResponse = PaginatedResponse<NoticeTargetWithData>;

export const noticeTypeOptions = [
  { value: "info", label: "Informativo" },
  { value: "warning", label: "Alerta" },
  { value: "error", label: "Erro" },
  { value: "success", label: "Sucesso" },
] as const;

export const noticePriorityOptions = [
  { value: 0, label: "Normal" },
  { value: 1, label: "Alta" },
  { value: 2, label: "Crítica" },
] as const;

export const noticeVisibilityOptions = [
  { value: "authenticated", label: "Autenticado" },
  { value: "public", label: "Público" },
] as const;

export const noticeStatusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "active", label: "Ativo" },
  { value: "expired", label: "Expirado" },
  { value: "inactive", label: "Inativo" },
] as const;

export function getNoticeTypeLabel(type: NoticeType) {
  return noticeTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function getNoticePriorityLabel(priority: NoticePriority) {
  return noticePriorityOptions.find((option) => option.value === priority)?.label ?? String(priority);
}

export function getNoticeVisibilityLabel(visibility: NoticeVisibility) {
  return noticeVisibilityOptions.find((option) => option.value === visibility)?.label ?? visibility;
}

export function getNoticeStatusLabel(status: NoticeStatus) {
  return noticeStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function getNoticeTargetTypeLabel(targetType: NoticeTargetType) {
  const labels: Record<NoticeTargetType, string> = {
    all: "Todos",
    sector: "Setor",
    user: "Usuário",
    role: "Perfil",
  };

  return labels[targetType];
}

export function getNoticeTypeBadgeVariant(type: NoticeType) {
  if (type === "success") {
    return "success" as const;
  }

  if (type === "warning") {
    return "warning" as const;
  }

  if (type === "error") {
    return "danger" as const;
  }

  return "info" as const;
}

export function getNoticePriorityBadgeVariant(priority: NoticePriority) {
  if (priority === 2) {
    return "danger" as const;
  }

  if (priority === 1) {
    return "warning" as const;
  }

  return "secondary" as const;
}

export function getNoticeStatusBadgeVariant(status: NoticeStatus) {
  if (status === "active") {
    return "success" as const;
  }

  if (status === "scheduled") {
    return "info" as const;
  }

  if (status === "expired") {
    return "danger" as const;
  }

  if (status === "inactive") {
    return "secondary" as const;
  }

  return "outline" as const;
}
