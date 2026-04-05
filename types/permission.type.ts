export interface PermissionRoleItem {
  id: number;
  name: string;
  slug: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  roles?: PermissionRoleItem[];
  roles_count?: number | null;
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

export interface PermissionFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreatePermissionDTO {
  name: string;
  slug?: string | null;
  description?: string | null;
}

export interface UpdatePermissionDTO {
  name?: string;
  slug?: string | null;
  description?: string | null;
}

export interface PermissionResponse {
  message: string;
  data: PermissionItem;
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

