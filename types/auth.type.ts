import type { PermissionAction } from "@/lib/permissions";

import type { Subunit } from "@/types/subunit.type";

export type PermissionMap = Record<string, Array<PermissionAction | "*">>;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarFallback: string;
  permissions: PermissionMap;
  subunits: Subunit[];
}

export interface LoginDTO {
  email: string;
  password: string;
}
