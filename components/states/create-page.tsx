"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StateForm } from "@/components/states/form";

export function StateCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("states");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `states.create` para cadastrar estados.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <StateForm mode="create" />;
}
