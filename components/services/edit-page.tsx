"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useService } from "@/hooks/use-services";
import { ServiceForm } from "@/components/services/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceEditPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("services");
  const serviceQuery = useService(params.id, Boolean(activeSubunit) && permissions.canUpdate);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar serviços.
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
          <CardDescription>
            O módulo depende da subunidade ativa para carregar o serviço.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (serviceQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[52rem] w-full" />
      </div>
    );
  }

  if (serviceQuery.isError || !serviceQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Não foi possível carregar o serviço</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se você possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar serviço
          </h1>
          <p className="text-sm text-slate-500">
            Atualize andamento, custos, observações e encerramento do serviço.
          </p>
        </div>
      </div>

      <ServiceForm mode="edit" service={serviceQuery.data.data} />
    </div>
  );
}
