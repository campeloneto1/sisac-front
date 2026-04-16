import type { AuthUser } from "@/types/auth.type";

export type PermissionAction =
  | "viewAny"
  | "view"
  | "create"
  | "update"
  | "delete"
  | "resetPassword"
  | "bulkPromote"
  | "transfer"
  | "dispose"
  | "borrow";
export type PermissionRequirement =
  | { type: "slug"; value: string }
  | { type: "resource"; resource: string; action: PermissionAction };

export function can(
  user: AuthUser | null,
  action: PermissionAction,
  resource: string,
) {
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

  return (
    resourcePermissions.includes("*") || resourcePermissions.includes(action)
  );
}

export function hasPermission(user: AuthUser | null, permissionSlug: string) {
  if (!user) {
    return false;
  }

  if (user.permissions["*"]?.includes("*")) {
    return true;
  }

  return user.permissionSlugs.includes(permissionSlug);
}

export function hasAllPermissions(
  user: AuthUser | null,
  requirements: PermissionRequirement[],
) {
  return requirements.every((requirement) => {
    if (requirement.type === "slug") {
      return hasPermission(user, requirement.value);
    }

    return can(user, requirement.action, requirement.resource);
  });
}
