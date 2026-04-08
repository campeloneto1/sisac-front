"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { ServiceTypeForm } from "@/components/service-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ServiceTypeCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("service-types");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `service-types.create` para
            cadastrar tipos de servico.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ServiceTypeForm mode="create" />;
}
