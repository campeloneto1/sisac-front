"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerLeave } from "@/hooks/use-police-officer-leaves";
import { PoliceOfficerLeaveForm } from "@/components/police-officer-leaves/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerLeaveEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-leaves");
  const policeOfficerLeaveQuery = usePoliceOfficerLeave(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `update` para editar afastamentos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerLeaveQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (policeOfficerLeaveQuery.isError || !policeOfficerLeaveQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar afastamento</CardTitle>
          <CardDescription>Os dados do afastamento nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerLeaveForm mode="edit" policeOfficerLeave={policeOfficerLeaveQuery.data.data} />;
}
