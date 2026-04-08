"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionForm } from "@/components/permissions/form";

export function PermissionCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("permissions");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `permissions.create` para cadastrar permissões.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PermissionForm mode="create" />;
}

