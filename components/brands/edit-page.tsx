"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useBrand } from "@/hooks/use-brands";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandForm } from "@/components/brands/form";

export function BrandEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("brands");
  const brandQuery = useBrand(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `brands.update` para editar marcas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (brandQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (brandQuery.isError || !brandQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar marca</CardTitle>
          <CardDescription>A marca não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <BrandForm mode="edit" brand={brandQuery.data.data} />;
}
