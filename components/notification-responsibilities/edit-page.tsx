"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useNotificationResponsibility } from "@/hooks/use-notification-responsibilities";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationResponsibilityForm } from "@/components/notification-responsibilities/form";

export function NotificationResponsibilityEditPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("notification-responsibilities");
  const itemQuery = useNotificationResponsibility(params.id, Boolean(activeSubunit));

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `notification-responsibilities.update` para editar este cadastro.
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
          <CardDescription>A edicao depende da subunidade ativa para carregar os setores permitidos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (itemQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar responsabilidade</CardTitle>
          <CardDescription>O cadastro nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (Number(activeSubunit.id) !== itemQuery.data.data.subunit_id) {
    return (
      <Card className="border-amber-200 bg-amber-50/60">
        <CardHeader>
          <CardTitle>Troque a subunidade ativa</CardTitle>
          <CardDescription>
            Esta regra pertence a outra subunidade. Para editar o setor responsavel com seguranca, altere o contexto global para a subunidade do registro.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <NotificationResponsibilityForm mode="edit" item={itemQuery.data.data} />;
}
