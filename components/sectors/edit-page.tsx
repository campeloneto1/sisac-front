"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSector } from "@/hooks/use-sectors";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectorForm } from "@/components/sectors/form";

export function SectorEditPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("sectors");
  const sectorQuery = useSector(params.id, Boolean(activeSubunit));

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `sectors.update` para editar setores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>A edicao do setor depende da subunidade ativa.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sectorQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (sectorQuery.isError || !sectorQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar setor</CardTitle>
          <CardDescription>O setor nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <SectorForm mode="edit" sector={sectorQuery.data.data} />;
}
