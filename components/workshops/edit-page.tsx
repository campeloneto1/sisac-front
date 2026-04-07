"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useWorkshop } from "@/hooks/use-workshops";
import { hasPermission } from "@/lib/permissions";
import { WorkshopForm } from "@/components/workshops/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkshopEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("workshops");
  const workshopQuery = useWorkshop(params.id);

  if (!hasPermission(user, "manager") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `manager` e `workshops.update` para editar oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (workshopQuery.isLoading) {
    return <Skeleton className="h-[620px] w-full" />;
  }

  if (workshopQuery.isError || !workshopQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar oficina</CardTitle>
          <CardDescription>
            Os dados da oficina nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <WorkshopForm mode="edit" workshop={workshopQuery.data.data} />;
}
