"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useEducationLevel } from "@/hooks/use-education-levels";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EducationLevelForm } from "@/components/education-levels/form";

export function EducationLevelEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("education-levels");
  const educationLevelQuery = useEducationLevel(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `education-levels.update` para editar niveis de escolaridade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (educationLevelQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (educationLevelQuery.isError || !educationLevelQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar nivel de escolaridade</CardTitle>
          <CardDescription>O nivel de escolaridade nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <EducationLevelForm mode="edit" educationLevel={educationLevelQuery.data.data} />;
}
