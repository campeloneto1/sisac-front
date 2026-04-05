import type { AuthUser } from "@/types/auth.type";

export type PermissionAction = "viewAny" | "view" | "create" | "update" | "delete" | "resetPassword";

export function can(user: AuthUser | null, action: PermissionAction, resource: string) {
  if (!user) {
    return false;
  }

  if (user.permissions["*"]?.includes("*")) {
    return true;
  }

  const resourcePermissions = user.permissions[resource];

  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes("*") || resourcePermissions.includes(action);
}
