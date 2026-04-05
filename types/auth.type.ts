import type { PermissionAction } from "@/lib/permissions";

import type { Subunit } from "@/types/subunit.type";

export type PermissionMap = Record<string, Array<PermissionAction | "*">>;

export interface AuthPermission {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface AuthRole {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  permissions?: AuthPermission[];
}

export interface AuthProfilePhoto {
  url: string;
  description?: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  document?: string | null;
  email: string;
  phone?: string | null;
  type?: string | null;
  type_label?: string | null;
  status?: string | null;
  status_label?: string | null;
  authorized_until?: string | null;
  email_verified_at?: string | null;
  profile_photo?: AuthProfilePhoto | null;
  role: AuthRole | null;
  avatarFallback: string;
  permissions: PermissionMap;
  subunits: Subunit[];
}

export interface LoginDTO {
  email: string;
  password: string;
  device_name?: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileDTO {
  name: string;
  email: string;
  phone?: string | null;
}

export interface AuthLoginResponse {
  message: string;
  data: {
    token_type: string;
    access_token: string;
    user: BackendAuthUser;
  };
}

export interface AuthMeResponse {
  message: string;
  data: BackendAuthUser;
}

export interface ApiMessageResponse {
  message: string;
}

export interface BackendAuthUser {
  id: number;
  name: string;
  document?: string | null;
  email: string;
  phone?: string | null;
  type?: string | null;
  type_label?: string | null;
  status?: string | null;
  status_label?: string | null;
  authorized_until?: string | null;
  email_verified_at?: string | null;
  profile_photo?: AuthProfilePhoto | null;
  role?: AuthRole | null;
  subunits?: Subunit[];
}
