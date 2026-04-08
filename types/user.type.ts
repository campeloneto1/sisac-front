import type { AuthProfilePhoto, AuthRole } from "@/types/auth.type";
import type { Subunit } from "@/types/subunit.type";

export interface UserListItem {
  id: number;
  name: string;
  document: string | null;
  email: string;
  phone: string | null;
  type: string | null;
  type_label: string | null;
  status: string | null;
  status_label: string | null;
  authorized_until: string | null;
  email_verified_at: string | null;
  profile_photo: AuthProfilePhoto | null;
  role: AuthRole | null;
  police_officer?: {
    id: number;
    registration_number?: string | null;
    badge_number?: string | null;
    war_name?: string | null;
  } | null;
  subunits?: Subunit[];
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

export interface PaginatedMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginatedMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
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

export interface UserResponse {
  message: string;
  data: UserListItem;
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role_id?: number | null;
}

export interface CreateUserDTO {
  name: string;
  document: string;
  email: string;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  type: string;
  status?: string | null;
  authorized_until?: string | null;
  role_id: number;
}

export interface UpdateUserDTO {
  name?: string;
  document?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  password_confirmation?: string;
  type?: string;
  status?: string | null;
  authorized_until?: string | null;
  role_id?: number;
}

export interface ResetUserPasswordDTO {
  password?: string;
  password_confirmation?: string;
}

export interface RoleOption {
  id: number;
  name: string;
  slug: string;
}

export interface RoleListResponse {
  data: RoleOption[];
  meta: PaginatedMeta;
}

export const userTypeOptions = [
  { value: "admin", label: "Administrador" },
  { value: "police_officer", label: "Policial" },
  { value: "external", label: "Externo" },
] as const;

export const userStatusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "pending_authorization", label: "Aguardando Autorização" },
  { value: "temporarily_authorized", label: "Temporariamente Autorizado" },
] as const;

