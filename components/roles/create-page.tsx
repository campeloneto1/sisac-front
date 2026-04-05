"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleForm } from "@/components/roles/form";

export function RoleCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("roles");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `roles.create` para cadastrar perfis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <RoleForm mode="create" />;
}

