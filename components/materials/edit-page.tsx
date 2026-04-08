"use client";

import { useParams } from "next/navigation";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterial } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { MaterialForm } from "@/components/materials/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialEditPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("materials");
  const materialQuery = useMaterial(id, Boolean(activeSubunit) && permissions.canUpdate);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar materiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>Escolha uma subunidade ativa antes de editar materiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materialQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (materialQuery.isError || !materialQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar material</CardTitle>
          <CardDescription>O material não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <MaterialForm mode="edit" material={materialQuery.data.data} />;
}
