"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useVariant } from "@/hooks/use-variants";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VariantForm } from "@/components/variants/form";

export function VariantEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("variants");
  const variantQuery = useVariant(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `variants.update` para editar variantes.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (variantQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (variantQuery.isError || !variantQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar variante</CardTitle>
          <CardDescription>A variante nao pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <VariantForm mode="edit" variant={variantQuery.data.data} />;
}
