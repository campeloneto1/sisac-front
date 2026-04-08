"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerPublication } from "@/hooks/use-police-officer-publications";
import { PoliceOfficerPublicationForm } from "@/components/police-officer-publications/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PoliceOfficerPublicationEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-publications");
  const policeOfficerPublicationQuery = usePoliceOfficerPublication(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar publicações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerPublicationQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (
    policeOfficerPublicationQuery.isError ||
    !policeOfficerPublicationQuery.data
  ) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar publicação</CardTitle>
          <CardDescription>
            Os dados da publicação não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PoliceOfficerPublicationForm
      mode="edit"
      policeOfficerPublication={policeOfficerPublicationQuery.data.data}
    />
  );
}
