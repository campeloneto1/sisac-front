"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useGender } from "@/hooks/use-genders";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GenderForm } from "@/components/genders/form";

export function GenderEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("genders");
  const genderQuery = useGender(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `genders.update` para editar gêneros.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (genderQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (genderQuery.isError || !genderQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar gênero</CardTitle>
          <CardDescription>O gênero não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <GenderForm mode="edit" gender={genderQuery.data.data} />;
}
