"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useStateItem } from "@/hooks/use-states";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StateForm } from "@/components/states/form";

export function StateEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("states");
  const stateQuery = useStateItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `states.update` para editar estados.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (stateQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (stateQuery.isError || !stateQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar estado</CardTitle>
          <CardDescription>O estado nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <StateForm mode="edit" stateItem={stateQuery.data.data} />;
}
