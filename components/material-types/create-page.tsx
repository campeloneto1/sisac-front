"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { MaterialTypeForm } from "@/components/material-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialTypeCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("material-types");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `material-types.create` para
            cadastrar tipos de material.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <MaterialTypeForm mode="create" />;
}
