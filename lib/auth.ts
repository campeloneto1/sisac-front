import type { BackendAuthUser, PermissionMap } from "@/types/auth.type";
import type { PermissionAction } from "@/lib/permissions";

export const AUTH_STORAGE_KEY = "sisac.auth-user";
export const AUTH_TOKEN_KEY = "sisac.auth-token";
export const AUTH_COOKIE = "sisac_session";

export function buildAvatarFallback(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

function normalizePermissionAction(action: string): PermissionAction | null {
  const normalized = action.trim().toLowerCase();

  switch (normalized) {
    case "view-any":
    case "viewany":
      return "viewAny";
    case "view":
      return "view";
    case "create":
      return "create";
    case "update":
      return "update";
    case "delete":
      return "delete";
    case "reset-password":
    case "resetpassword":
      return "resetPassword";
    default:
      return null;
  }
}

export function mapPermissions(user: BackendAuthUser): PermissionMap {
  const entries = user.role?.permissions ?? [];

  return entries.reduce<PermissionMap>((acc, permission) => {
    const [resource, action] = permission.slug.split(".");

    if (!resource || !action) {
      return acc;
    }

    const normalizedAction = normalizePermissionAction(action);

    if (!normalizedAction) {
      return acc;
    }

    const nextValues = new Set(acc[resource] ?? []);
    nextValues.add(normalizedAction);
    acc[resource] = Array.from(nextValues);
    return acc;
  }, {});
}

export function normalizeAuthUser(user: BackendAuthUser) {
  return {
    ...user,
    role: user.role ?? null,
    subunits: user.subunits ?? [],
    permissions: mapPermissions(user),
    avatarFallback: buildAvatarFallback(user.name, user.email),
  };
}
