"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunitItem } from "@/hooks/use-subunits";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubunitForm } from "@/components/subunits/form";

export function SubunitEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("subunits");
  const subunitQuery = useSubunitItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `subunits.update` para editar subunidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (subunitQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (subunitQuery.isError || !subunitQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar subunidade</CardTitle>
          <CardDescription>A subunidade nao pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <SubunitForm mode="edit" subunit={subunitQuery.data.data} />;
}
