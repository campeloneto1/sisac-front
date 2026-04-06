"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePublicationType } from "@/hooks/use-publication-types";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationTypeForm } from "@/components/publication-types/form";

export function PublicationTypeEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("publication-types");
  const publicationTypeQuery = usePublicationType(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `update` para editar tipos de publicacao.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (publicationTypeQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (publicationTypeQuery.isError || !publicationTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de publicacao</CardTitle>
          <CardDescription>Os dados nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PublicationTypeForm mode="edit" publicationType={publicationTypeQuery.data.data} />;
}
