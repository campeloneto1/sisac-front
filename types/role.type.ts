export interface RolePermissionItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface RoleItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  users_count?: number | null;
  permissions_count?: number | null;
  permissions?: RolePermissionItem[];
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

export interface RoleFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateRoleDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
  permission_ids?: number[];
}

export interface UpdateRoleDTO {
  name?: string;
  slug?: string | null;
  description?: string | null;
  permission_ids?: number[];
}

export interface RoleResponse {
  message: string;
  data: RoleItem;
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

export interface PermissionOption {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

