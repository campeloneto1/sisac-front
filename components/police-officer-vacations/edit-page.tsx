"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerVacation } from "@/hooks/use-police-officer-vacations";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerVacationForm } from "@/components/police-officer-vacations/form";

export function PoliceOfficerVacationEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-vacations");
  const vacationQuery = usePoliceOfficerVacation(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar férias.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (vacationQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (vacationQuery.isError || !vacationQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar férias</CardTitle>
          <CardDescription>Os dados do registro anual não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerVacationForm mode="edit" policeOfficerVacation={vacationQuery.data.data} />;
}
