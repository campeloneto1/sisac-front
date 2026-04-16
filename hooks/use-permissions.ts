"use client";

import { can, type PermissionAction } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";

export function usePermissions(resource: string) {
  const { user } = useAuth();

  return {
    can: (action: PermissionAction) => can(user, action, resource),
    canViewAny: can(user, "viewAny", resource),
    canView: can(user, "view", resource),
    canCreate: can(user, "create", resource),
    canUpdate: can(user, "update", resource),
    canDelete: can(user, "delete", resource),
    canTransfer: can(user, "transfer", resource),
    canDispose: can(user, "dispose", resource),
    canBulkPromote: can(user, "bulkPromote", resource),
    canResetPassword: can(user, "resetPassword", resource),
    canBorrow: can(user, "borrow", resource),
  };
}
