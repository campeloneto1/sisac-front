"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRetirementRequest } from "@/hooks/use-police-officer-retirement-requests";
import { PoliceOfficerRetirementRequestForm } from "@/components/police-officer-retirement-requests/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerRetirementRequestEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-retirement-requests");
  const retirementRequestQuery = usePoliceOfficerRetirementRequest(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `update` para editar requerimentos de
            aposentadoria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (retirementRequestQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (retirementRequestQuery.isError || !retirementRequestQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar requerimento</CardTitle>
          <CardDescription>
            Os dados do requerimento nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PoliceOfficerRetirementRequestForm
      mode="edit"
      policeOfficerRetirementRequest={retirementRequestQuery.data.data}
    />
  );
}
