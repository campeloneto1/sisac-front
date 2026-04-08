"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMaterialType } from "@/hooks/use-material-types";
import { hasPermission } from "@/lib/permissions";
import { MaterialTypeForm } from "@/components/material-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialTypeEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("material-types");
  const materialTypeQuery = useMaterialType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `material-types.update` para
            editar tipos de material.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materialTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (materialTypeQuery.isError || !materialTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de material</CardTitle>
          <CardDescription>
            O tipo de material nao pode ser editado agora.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <MaterialTypeForm
      mode="edit"
      materialType={materialTypeQuery.data.data}
    />
  );
}
