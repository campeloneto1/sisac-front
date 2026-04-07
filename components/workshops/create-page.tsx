"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { WorkshopForm } from "@/components/workshops/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkshopCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("workshops");

  if (!hasPermission(user, "manager") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `manager` e `workshops.create` para cadastrar
            oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <WorkshopForm mode="create" />;
}
