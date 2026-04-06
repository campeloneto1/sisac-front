"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useUnitItem } from "@/hooks/use-units";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitForm } from "@/components/units/form";

export function UnitEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("units");
  const unitQuery = useUnitItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `units.update` para editar unidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (unitQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (unitQuery.isError || !unitQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar unidade</CardTitle>
          <CardDescription>A unidade nao pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <UnitForm mode="edit" unit={unitQuery.data.data} />;
}
