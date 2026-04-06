"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentForm } from "@/components/assignments/form";

export function AssignmentCreatePage() {
  const permissions = usePermissions("assignments");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar funções e atribuições.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <AssignmentForm mode="create" />;
}
