"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UnitForm } from "@/components/units/form";

export function UnitCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("units");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `units.create` para cadastrar unidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <UnitForm mode="create" />;
}
