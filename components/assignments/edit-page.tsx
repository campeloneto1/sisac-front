"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useAssignment } from "@/hooks/use-assignments";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentForm } from "@/components/assignments/form";

export function AssignmentEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("assignments");
  const assignmentQuery = useAssignment(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar funções e atribuições.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (assignmentQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (assignmentQuery.isError || !assignmentQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar função</CardTitle>
          <CardDescription>A função não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <AssignmentForm mode="edit" assignment={assignmentQuery.data.data} />;
}
