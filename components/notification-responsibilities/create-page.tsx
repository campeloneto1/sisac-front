"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationResponsibilityForm } from "@/components/notification-responsibilities/form";

export function NotificationResponsibilityCreatePage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notification-responsibilities");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `notification-responsibilities.create` para cadastrar responsabilidades de notificação.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O cadastro exige uma subunidade ativa para carregar os setores e enviar o header `X-Active-Subunit`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <NotificationResponsibilityForm mode="create" />;
}
