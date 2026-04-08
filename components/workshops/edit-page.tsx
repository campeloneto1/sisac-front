"use client";

import { useParams } from "next/navigation";
import { Wrench } from "lucide-react";

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
            Você precisa de `manager` e `workshops.update` para editar
            oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (workshopQuery.isLoading) {
    return <Skeleton className="h-[680px] w-full" />;
  }

  if (workshopQuery.isError || !workshopQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar oficina</CardTitle>
          <CardDescription>
            Os dados da oficina não estão disponíveis para edição no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar oficina
          </h1>
          <p className="text-sm text-slate-500">
            Atualize contatos, localização, status e especialidades da oficina.
          </p>
        </div>
      </div>

      <WorkshopForm mode="edit" workshop={workshopQuery.data.data} />
    </div>
  );
}
